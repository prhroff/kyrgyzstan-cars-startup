// Pure decision logic for the protect-secrets hook (I/O only via injected ctx.exists / ctx.list).
//
// Blocks: reading/printing secret files, writing/deleting them, staging/committing them, printing
// secret environment variables, disabling the gitleaks pre-commit hook. Allows: mentioning ".env"
// in text, existence checks, `cp .env.example .env` while .env does not exist, project programs
// that load env files themselves. Heuristic by nature: a safety net, gitleaks is the last line.
import path from "node:path";

// ── What counts as secret ──────────────────────────────────────────────────────────────────────

const SAFE_ENV_SUFFIX = /^(example|sample|template)$/i;

/** .env, .env.local, .env.production…, private keys, certificates, credential stores. */
export function isSecretFileName(name) {
  const base = name.toLowerCase();
  if (base === ".env") return true;
  if (base.startsWith(".env.")) return !SAFE_ENV_SUFFIX.test(base.slice(5));
  return (
    /\.(pem|key|p12|pfx)$/.test(base) ||
    /^id_(rsa|ecdsa|ed25519)$/.test(base) ||
    ["credentials.json", ".pgpass", ".netrc"].includes(base)
  );
}

const SECRET_VAR =
  /^(\w*DATABASE_URL\w*|\w*(SECRET|TOKEN|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|ACCESS_KEY|DSN|CREDENTIALS?)\w*)$/i;

export function isSecretVarName(name) {
  return SECRET_VAR.test(name);
}

/** Basename of a path-like token, without `--opt=` / `key=` / `-Path:` prefixes and `@` (curl). */
export function baseOf(token) {
  let t = token.trim();
  if (/^[^\\/=]*=/.test(t)) t = t.slice(t.indexOf("=") + 1);
  else if (/^-\w+:/.test(t)) t = t.slice(t.indexOf(":") + 1);
  if (t.startsWith("@")) t = t.slice(1);
  return t.split(/[\\/]/).pop() ?? "";
}

// ── Shell lexer ────────────────────────────────────────────────────────────────────────────────

const SHELLS = /^(sh|bash|zsh|dash|ksh)$/;
const POWERSHELLS = /^(powershell|pwsh)$/;
const CODE_RUNNERS = /^(node|deno|bun|tsx|python3?|py|ruby|perl|php)$/;

function commandName(word) {
  return path
    .basename(word.replace(/\\/g, "/"))
    .toLowerCase()
    .replace(/\.exe$/, "");
}

/**
 * Splits heredocs / here-strings out of a command. Their bodies are data (commit messages, files)
 * unless fed to a shell or interpreter (`bash <<EOF`, `node <<EOF`) — those are returned as code.
 */
export function splitHeredocs(command) {
  const code = [];
  const stripped = command
    .replace(
      /(^|\n|[;&|(])([^\n;&|(]*?)<<-?[ \t]*(['"]?)([A-Za-z_]\w*)\3([^\n]*)\n([\s\S]*?)\n[ \t]*\4[ \t]*(?=\r?\n|$)/g,
      (_m, lead, before, _q, _tag, after, body) => {
        const runner = commandName(before.trim().split(/\s+/)[0] ?? "");
        if (SHELLS.test(runner)) code.push({ kind: "bash", text: body });
        else if (POWERSHELLS.test(runner)) code.push({ kind: "powershell", text: body });
        else if (CODE_RUNNERS.test(runner)) code.push({ kind: "code", text: body });
        return `${lead}${before}<<'X'${after}`;
      },
    )
    .replace(/@'\r?\n[\s\S]*?\r?\n'@/g, "''")
    .replace(/@"\r?\n[\s\S]*?\r?\n"@/g, '""');
  return { stripped, code };
}

/**
 * Splits a command line into simple commands: `{ words: [{raw, text}], redirects: [{op, target}] }`.
 * `raw` keeps quotes (to tell `'$X'` from `$X`), `text` is unquoted. `$(…)` and bash backticks
 * outside single quotes go to `nested`. Unquoted `( ) { }` separate commands (subshells, groups,
 * PowerShell sub-expressions). mode: "bash" | "powershell".
 */
export function lex(command, mode) {
  const segments = [];
  const nested = [];
  const esc = mode === "powershell" ? "`" : "\\";
  let words = [];
  let redirects = [];
  let raw = "";
  let text = "";
  let inWord = false;
  let pendingRedirect = null;
  let quote = null;

  const resetWord = () => {
    raw = "";
    text = "";
    inWord = false;
  };
  const endWord = () => {
    if (!inWord) return;
    if (pendingRedirect) redirects.push({ op: pendingRedirect, target: text });
    else words.push({ raw, text });
    pendingRedirect = null;
    resetWord();
  };
  const endSegment = () => {
    endWord();
    if (words.length || redirects.length) segments.push({ words, redirects });
    words = [];
    redirects = [];
    pendingRedirect = null;
  };

  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    const next = command[i + 1];
    if (quote === "'") {
      raw += c;
      if (c === "'") quote = null;
      else text += c;
      continue;
    }
    if (c === esc && next !== undefined) {
      const literal = mode === "bash" && quote === '"' && !'$`"\\\n'.includes(next);
      raw += c + next;
      text += literal ? c + next : next;
      inWord = true;
      i++;
      continue;
    }
    if (c === "$" && next === "(") {
      let depth = 1;
      let j = i + 2;
      for (; j < command.length && depth > 0; j++) {
        if (command[j] === "(") depth++;
        else if (command[j] === ")") depth--;
      }
      nested.push(command.slice(i + 2, j - 1));
      raw += command.slice(i, j);
      text += "$()";
      inWord = true;
      i = j - 1;
      continue;
    }
    if (c === "`" && mode === "bash") {
      const end = command.indexOf("`", i + 1);
      const stop = end === -1 ? command.length : end;
      nested.push(command.slice(i + 1, stop));
      raw += command.slice(i, stop + 1);
      inWord = true;
      i = stop;
      continue;
    }
    if (quote === '"') {
      raw += c;
      if (c === '"') quote = null;
      else text += c;
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      raw += c;
      inWord = true;
      continue;
    }
    if (c === "\n" || c === ";" || c === "|" || c === "&" || c === "(" || c === ")") {
      endSegment();
      continue;
    }
    if ((c === "{" || c === "}") && !inWord && /[\s;]|^$/.test(next ?? "")) {
      endSegment(); // bash group braces `{ cmd; }`; braces inside words ({a,b}, ${x}) stay.
      continue;
    }
    if (/\s/.test(c)) {
      endWord();
      continue;
    }
    if (c === ">" || c === "<") {
      if (next === "&") {
        // fd duplication (2>&1, >&2): not a file.
        if (inWord && /^\d$/.test(text) && raw === text) resetWord();
        endWord();
        i++;
        while (/[\d-]/.test(command[i + 1] ?? "")) i++;
        continue;
      }
      if (inWord && /^\d$/.test(text) && raw === text) resetWord();
      else endWord();
      let op = c;
      while (command[i + 1] === c) {
        op += c;
        i++;
      }
      pendingRedirect = op.startsWith("<<") ? "heredoc" : op;
      continue;
    }
    raw += c;
    text += c;
    inWord = true;
  }
  endSegment();
  return { segments, nested };
}

// ── Rules ──────────────────────────────────────────────────────────────────────────────────────

const set = (s) => new Set(s.split(/\s+/));
const READERS = set(
  "cat type more less head tail tac nl od xxd hexdump strings base64 bat cut awk gawk sed perl " +
    "diff cmp comm sort uniq paste fold iconv vim vi nvim nano code notepad scp curl " +
    "get-content gc select-string sls findstr grep egrep fgrep rg ag import-csv format-hex fhx",
);
const PATTERN_FIRST = set("grep egrep fgrep rg ag findstr select-string sls");
const WRITERS = set(
  "tee set-content sc add-content ac out-file new-item ni clear-content clc rm del erase " +
    "remove-item ri mv move move-item mi ren rename rename-item rni truncate shred touch chmod",
);
const COPIERS = set("cp copy copy-item cpi xcopy");
const PRINTERS = set("echo printf print write-output write write-host write-information out-host");
const WRAPPERS = set(
  "sudo command exec time nohup nice builtin then do else elif if while until ! xargs",
);
const GREP_VALUE_OPTS = set("-A -B -C -m -e -f --regexp --file --include --exclude");
const INTERPRETER =
  /\b(node|deno|bun|tsx|python3?|py|ruby|perl|php)(\.exe)?\b[^|;&\n]*?\s(-e|-c|-p|-r|--eval|--print)\b/;

/** Secret variable names referenced (and expanded) in a raw word; single-quoted text is literal. */
function secretVarRefs(rawWord) {
  const expandable = rawWord.replace(/'[^']*'/g, "");
  const names = [];
  for (const m of expandable.matchAll(/\$\{?env:(\w+)|\$\{(\w+)|\$(\w+)|%(\w+)%/gi)) {
    const name = m[1] ?? m[2] ?? m[3] ?? m[4];
    if (name && isSecretVarName(name)) names.push(name);
  }
  return names;
}

/** Bash brace expansion: `{.env.local,x}` → [".env.local", "x"]. */
function expandBraces(token) {
  const m = /^(.*?)\{([^{}]*,[^{}]*)\}(.*)$/.exec(token);
  if (!m) return [token];
  return m[2].split(",").flatMap((part) => expandBraces(`${m[1]}${part}${m[3]}`));
}

function globToRegex(glob) {
  let body = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") body += ".*";
    else if (c === "?") body += ".";
    else if (c === "[" && glob.indexOf("]", i + 2) !== -1) {
      const end = glob.indexOf("]", i + 2);
      body += `[${glob
        .slice(i + 1, end)
        .replace(/^!/, "^")
        .replace(/\\/g, "\\\\")}]`;
      i = end;
    } else body += c.replace(/[.+^${}()|\\[\]]/g, "\\$&");
  }
  return new RegExp(`^${body}$`, "i");
}

/** Secret file names a token can refer to: a literal name, or a glob over an existing directory. */
function secretTargets(token, ctx) {
  return expandBraces(token).flatMap((t) => {
    const base = baseOf(t);
    if (!base) return [];
    if (!/[*?[]/.test(base)) return isSecretFileName(base) ? [base] : [];
    const dir = t.slice(0, t.length - base.length) || ".";
    const re = globToRegex(base);
    const dotOk = ctx.mode === "powershell" || base.startsWith(".");
    return ctx
      .list(dir)
      .filter((n) => isSecretFileName(n) && re.test(n) && (dotOk || !n.startsWith(".")));
  });
}

/** File arguments of a reader; for grep-likes the search pattern is not a file. */
function fileArgs(cmd, args) {
  const grepLike = PATTERN_FIRST.has(cmd);
  const out = [];
  let patternSeen = !grepLike;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (grepLike) {
      if (GREP_VALUE_OPTS.has(a) || /^-pattern$/i.test(a)) {
        if (/^(-e|-f|--regexp|--file|-pattern)$/i.test(a)) patternSeen = true;
        i++;
        continue;
      }
      if (/^--(regexp|file)=/.test(a)) {
        patternSeen = true;
        continue;
      }
      if (/^-(literal)?path$/i.test(a)) {
        if (args[i + 1] !== undefined) out.push(args[i + 1]);
        i++;
        continue;
      }
    }
    const isOption =
      (a.startsWith("-") && a.length > 1) || (cmd === "findstr" && a.startsWith("/"));
    if (isOption) {
      if (!grepLike && /[=:]/.test(a)) out.push(a);
      continue;
    }
    if (!patternSeen) {
      patternSeen = true;
      continue;
    }
    out.push(a);
  }
  return out;
}

/** Values of `--opt=value` and `--opt value`. */
function optionValues(args, name) {
  const values = [];
  args.forEach((a, i) => {
    if (a === name && args[i + 1] !== undefined) values.push(args[i + 1]);
    else if (a.startsWith(`${name}=`)) values.push(a.slice(name.length + 1));
  });
  return values;
}

/** A recursive search that would include a secret file at the top of a searched directory. */
function recursiveSearchHit(cmd, args, ctx) {
  const joined = ` ${args.join(" ")} `;
  if (cmd === "rg" || cmd === "ag") {
    if (!/\s(--hidden|--no-ignore|--unrestricted|-u+|-\.)\s/.test(joined)) return undefined;
  } else if (cmd === "findstr") {
    if (!args.some((a) => /^\/s$/i.test(a))) return undefined;
  } else if (cmd === "select-string" || cmd === "sls") {
    return undefined;
  } else if (!args.some((a) => /^-[a-zA-Z]*[rR][a-zA-Z]*$|^--(dereference-)?recursive$/.test(a))) {
    return undefined;
  }
  const roots = fileArgs(cmd, args);
  const secrets = (roots.length ? roots : ["."]).flatMap((d) =>
    ctx.list(d).filter(isSecretFileName),
  );
  const includes = [
    ...optionValues(args, "--include"),
    ...optionValues(args, "--glob"),
    ...optionValues(args, "-g"),
  ];
  const excludes = optionValues(args, "--exclude").map(globToRegex);
  return secrets.find((name) => {
    if (excludes.some((re) => re.test(name))) return false;
    const included = includes.some((g) => !g.startsWith("!") && globToRegex(g).test(name));
    return includes.length === 0 || included;
  });
}

/** Drops variable assignments, wrappers and shell keywords in front of the real command. */
function mentionsSecretFile(text) {
  return text.split(/[\s'"|;&()<>]+/).some((t) => t && isSecretFileName(baseOf(t)));
}

/** .NET calls in PowerShell: [IO.File]::ReadAllText('.env'), [Environment]::GetEnvironmentVariable(s). */
function checkDotNet(text) {
  if (/\[(system\.)?environment\]::getenvironmentvariables\s*\(/i.test(text)) {
    return "вывод всех переменных окружения ([Environment])";
  }
  const v = /\[(system\.)?environment\]::getenvironmentvariable\s*\(\s*['"](\w+)['"]/i.exec(text);
  if (v && isSecretVarName(v[2])) return `вывод секретной переменной ${v[2]}`;
  const f =
    /\[(system\.)?(io\.)?file\]::(readall\w*|readlines|openread|opentext|copy)\s*\(\s*['"]([^'"]+)['"]/i.exec(
      text,
    );
  if (f && isSecretFileName(baseOf(f[4]))) return `чтение ${baseOf(f[4])} через [IO.File]`;
  return null;
}

function stripWrappers(segmentWords) {
  let w = segmentWords;
  for (;;) {
    if (!w.length) return w;
    const first = w[0].text;
    const name = commandName(first);
    if (/^[A-Za-z_]\w*=/.test(first) || WRAPPERS.has(name)) {
      w = w.slice(1);
      if (name === "xargs") while (w.length && w[0].text.startsWith("-")) w = w.slice(1);
    } else if (name === "env" && w.length > 1 && /^(-\w+|[A-Za-z_]\w*=)/.test(w[1].text)) {
      w = w.slice(1);
      while (w.length && /^(-\w+|[A-Za-z_]\w*=)/.test(w[0].text)) w = w.slice(1);
    } else return w;
  }
}

function checkEnvDump(cmd, args, rawArgs) {
  if (cmd === "printenv") {
    if (!args.length) return "вывод всех переменных окружения (printenv)";
    const secret = args.find(isSecretVarName);
    if (secret) return `вывод секретной переменной ${secret}`;
  }
  if (cmd === "env" && args.every((a) => a.startsWith("-"))) {
    return "вывод всех переменных окружения (env)";
  }
  if (
    ["set", "export", "declare", "typeset"].includes(cmd) &&
    args.every((a) => /^-[px]+$/.test(a))
  ) {
    if (cmd !== "set" || !args.length) return `вывод всех переменных окружения (${cmd})`;
  }
  const envDrive = args.find((a) => /^env:/i.test(a));
  if (envDrive && /^(get-childitem|gci|dir|ls|get-item|gi|get-content|gc|cat|type)$/.test(cmd)) {
    const name = envDrive.slice(4).replace(/^[\\/]/, "");
    if (!name || /[*?]/.test(name) || isSecretVarName(name)) {
      return `вывод переменных окружения (${envDrive})`;
    }
  }
  if (PRINTERS.has(cmd)) {
    const secret = rawArgs.flatMap(secretVarRefs)[0];
    if (secret) return `вывод секретной переменной ${secret}`;
  }
  return null;
}

function checkGit(args, ctx) {
  let i = 0;
  while (i < args.length && args[i].startsWith("-")) {
    if (args[i] === "-c" && /^core\.hookspath=/i.test(args[i + 1] ?? "")) {
      return "отключение git-хуков (core.hooksPath)";
    }
    i += /^-[Cc]$/.test(args[i]) ? 2 : 1;
  }
  const sub = args[i];
  const rest = args.slice(i + 1);
  if (sub === "config") {
    const at = rest.findIndex((a) => /^core\.hookspath$/i.test(a));
    if (at < 0) return null;
    const unset = rest.some((a) => /^--(unset|unset-all|remove-section)$/.test(a));
    return unset || rest[at + 1] !== ".githooks"
      ? "смена core.hooksPath отключит pre-commit с gitleaks"
      : null;
  }
  if (!["add", "stage", "commit"].includes(sub)) return null;
  const force = rest.some((a) => a === "--force" || /^-[a-zA-Z]*f[a-zA-Z]*$/.test(a));
  for (let j = 0; j < rest.length; j++) {
    const a = rest[j];
    if (/^(-m|-F|--message|--file|--author|--date|-C|-c)$/.test(a)) {
      j++; // the value is a message / file / metadata, not a pathspec
      continue;
    }
    if (/^--(message|file|author|date)=/.test(a)) continue;
    if (sub === "commit" && (a === "--no-verify" || /^-[a-zA-Z]*n[a-zA-Z]*$/.test(a))) {
      return "git commit --no-verify пропустит проверку gitleaks";
    }
    if (a.startsWith("-")) {
      if (
        sub !== "commit" &&
        force &&
        /^(-A|--all)$/.test(a) &&
        ctx.list(".").some(isSecretFileName)
      ) {
        return "git add -f -A добавит игнорируемые секретные файлы";
      }
      continue;
    }
    const hit = secretTargets(a, ctx)[0];
    if (hit) return `git ${sub} ${hit}`;
    if (sub !== "commit" && force) {
      const inside = ctx.list(a).find(isSecretFileName);
      if (inside) return `git ${sub} -f ${a} добавит игнорируемый ${inside}`;
    }
  }
  return null;
}

function checkCopy(args, ctx) {
  const named = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (/^-(path|literalpath|destination)$/i.test(a)) {
      named[a.slice(1).toLowerCase()] = args[i + 1] ?? "";
      i++;
    } else if (!a.startsWith("-") && !/^\/[a-z]{1,2}$/i.test(a)) positional.push(a);
  }
  const src = named.path ?? named.literalpath;
  const sources = src !== undefined ? [src] : positional.slice(0, -1);
  const dest = named.destination ?? (src !== undefined ? positional[0] : positional.at(-1));
  const secretSource = sources.find((s) => secretTargets(s, ctx).length > 0);
  if (secretSource) return `копирование секретного файла ${baseOf(secretSource)}`;
  if (dest && secretTargets(dest, ctx).length > 0) {
    const fromExample =
      sources.length > 0 && sources.every((s) => /^\.env\.example$/i.test(baseOf(s)));
    if (!fromExample) return `запись в ${baseOf(dest)} копированием`;
    if (ctx.exists(dest)) return `${baseOf(dest)} уже существует — перезапись запрещена`;
  }
  return null;
}

/** Commands that run another command line from an argument: bash -c, eval, cmd /c, pwsh -c. */
function innerCommand(cmd, args) {
  if (SHELLS.test(cmd)) {
    const i = args.findIndex((a) => /^-[a-zA-Z]*c[a-zA-Z]*$/.test(a));
    return i >= 0 && args[i + 1] !== undefined ? { mode: "bash", text: args[i + 1] } : null;
  }
  if (cmd === "eval") return { mode: "bash", text: args.join(" ") };
  if (cmd === "cmd") {
    const i = args.findIndex((a) => /^\/[ck]$/i.test(a));
    return i >= 0 ? { mode: "powershell", text: args.slice(i + 1).join(" ") } : null;
  }
  if (POWERSHELLS.test(cmd)) {
    const i = args.findIndex((a) => /^-(c|command)$/i.test(a));
    return i >= 0 ? { mode: "powershell", text: args.slice(i + 1).join(" ") } : null;
  }
  if (cmd === "invoke-expression" || cmd === "iex") {
    return { mode: "powershell", text: args.join(" ") };
  }
  return null;
}

/** find … -exec cat {} \; over files whose -name filter can match a secret (or no filter). */
function checkFind(args, ctx) {
  const execAt = args.findIndex((a) => /^-(exec|execdir|ok|okdir)$/.test(a));
  if (execAt < 0) return null;
  const runner = commandName(args[execAt + 1] ?? "");
  if (!READERS.has(runner) && !WRITERS.has(runner) && !COPIERS.has(runner)) return null;
  const names = [
    ...optionValues(args, "-name"),
    ...optionValues(args, "-iname"),
    ...optionValues(args, "-path"),
  ];
  const samples = [".env", ".env.local", ".env.production", "id_rsa", "key.pem"];
  const canMatch = names.some(
    (n) => samples.some((s) => globToRegex(baseOf(n)).test(s)) || secretTargets(n, ctx).length > 0,
  );
  return canMatch || names.length === 0 ? `find -exec ${runner} по секретным файлам` : null;
}

/** Block reason for one simple command, or null. Inner command lines are queued in `pending`. */
function checkSegment(seg, ctx, pending) {
  for (const r of seg.redirects) {
    if (r.op === "heredoc") continue;
    const hit = secretTargets(r.target, ctx)[0];
    if (hit) return `${r.op === "<" ? "чтение" : "запись"} ${hit} через перенаправление`;
  }
  const w = stripWrappers(seg.words);
  if (!w.length) return null;
  const first = w[0];

  // A bare expression prints its value (PowerShell) or leaks it in "command not found" (bash).
  const bareSecret = secretVarRefs(first.raw)[0];
  if (bareSecret) return `вывод секретной переменной ${bareSecret}`;

  const cmd = commandName(first.text);
  // `… | xargs cat`: file names come from stdin — block if the command line names a secret file.
  const viaXargs = seg.words.some((x) => commandName(x.text) === "xargs");
  if (viaXargs && READERS.has(cmd) && mentionsSecretFile(ctx.fullText ?? "")) {
    return `xargs ${cmd} по секретному файлу`;
  }
  const args = w.slice(1).map((x) => x.text);
  const rawArgs = w.slice(1).map((x) => x.raw);

  const inner = innerCommand(cmd, args);
  if (inner) {
    pending.push(inner);
    return null;
  }
  const dump = checkEnvDump(cmd, args, rawArgs);
  if (dump) return dump;
  if (cmd === "git") return checkGit(args, ctx);
  if (cmd === "find") return checkFind(args, ctx);
  if (COPIERS.has(cmd)) return checkCopy(args, ctx);
  if (WRITERS.has(cmd)) {
    const hit = args.flatMap((a) => secretTargets(a, ctx))[0];
    return hit ? `изменение/удаление ${hit} (${cmd})` : null;
  }
  if (READERS.has(cmd)) {
    const targets = cmd === "sed" || cmd === "perl" ? args : fileArgs(cmd, args);
    const hit = targets.flatMap((a) => secretTargets(a, ctx))[0];
    if (hit) return `чтение ${hit} (${cmd})`;
    const recursive = PATTERN_FIRST.has(cmd) ? recursiveSearchHit(cmd, args, ctx) : undefined;
    if (recursive) {
      return `рекурсивный поиск захватит ${recursive} — добавь --exclude='.env*' или сузь путь`;
    }
  }
  return null;
}

/** Interpreter code that prints secret env vars or reads secret files. `force` = known to be code. */
function checkInlineCode(code, force = false) {
  if (!force && !INTERPRETER.test(code)) return null;
  const prints =
    /(console\.\w+|process\.stdout\.write|print|puts)\s*\(/.test(code) ||
    /\s(-p|--print)\b/.test(code);
  if (prints) {
    const wholeEnv =
      /(console\.\w+|print|process\.stdout\.write)\s*\(\s*(JSON\.stringify\(\s*)?(process\.env|os\.environ)\s*[),]/;
    const printFlagEnv =
      /\s(-p|--print)\s+['"]?\s*(JSON\.stringify\(\s*)?process\.env\s*\)?\s*['"]?(\s|$)/;
    if (wholeEnv.test(code) || printFlagEnv.test(code)) {
      return "вывод всех переменных окружения из кода";
    }
    if (/\.parsed\b|dotenv\.parse\(/.test(code)) return "вывод содержимого env-файла через dotenv";
    const refs = [
      ...code.matchAll(/process\.env(?:\.(\w+)|\[\s*['"](\w+)['"]\s*\])/g),
      ...code.matchAll(
        /os\.(?:environ\[\s*['"](\w+)['"]\s*\]|environ\.get\(\s*['"](\w+)['"]|getenv\(\s*['"](\w+)['"])/g,
      ),
    ];
    for (const m of refs) {
      const name = m.slice(1).find(Boolean);
      if (name && isSecretVarName(name)) return `вывод секретной переменной ${name} из кода`;
    }
  }
  if (/readFileSync|readFile\(|createReadStream|open\(|Get-Content/.test(code)) {
    for (const m of code.matchAll(/'([^'\s]*)'|"([^"\s]*)"/g)) {
      const literal = m[1] ?? m[2] ?? "";
      if (isSecretFileName(baseOf(literal))) return `чтение ${baseOf(literal)} из кода`;
    }
  }
  return null;
}

/** Shell command check. Returns a block reason or null. */
export function checkShellCommand(command, ctx) {
  const pending = [{ mode: ctx.mode, text: command }];
  for (let guard = 0; pending.length > 0 && guard < 50; guard++) {
    const job = pending.shift();
    if (job.mode === "code") {
      const reason = checkInlineCode(job.text, true);
      if (reason) return reason;
      continue;
    }
    const { stripped, code } = splitHeredocs(job.text);
    for (const c of code) pending.push({ mode: c.kind, text: c.text });
    const dotNet = checkDotNet(stripped);
    if (dotNet) return dotNet;
    const jobCtx = { ...ctx, mode: job.mode, fullText: stripped };
    const { segments, nested } = lex(stripped, job.mode);
    for (const seg of segments) {
      const reason = checkSegment(seg, jobCtx, pending);
      if (reason) return reason;
    }
    for (const n of nested) pending.push({ mode: job.mode, text: n });
    const inline = checkInlineCode(stripped);
    if (inline) return inline;
  }
  return null;
}

/**
 * PreToolUse payload → block reason or null. `ctx.exists(path)` and `ctx.list(dir)` resolve
 * paths relative to the session cwd. Read/Edit are primarily covered by permissions.deny in
 * .claude/settings.json; this is the second line and the only line for shell commands.
 */
export function checkToolCall(input, ctx) {
  const tool = input.tool_name ?? "";
  const args = input.tool_input ?? {};
  if (["Read", "Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
    const file = args.file_path ?? args.notebook_path;
    return typeof file === "string" && isSecretFileName(baseOf(file))
      ? `${tool} ${baseOf(file)}`
      : null;
  }
  if (tool === "Grep") {
    if (typeof args.path === "string" && isSecretFileName(baseOf(args.path))) {
      return `Grep по ${baseOf(args.path)}`;
    }
    const envGlob = /(^|[\\/{,])\.env(?!\.(example|sample|template)\b)/i;
    if (typeof args.glob === "string" && envGlob.test(args.glob)) return `Grep glob ${args.glob}`;
    return null;
  }
  if (tool === "Bash" || tool === "PowerShell") {
    const command = typeof args.command === "string" ? args.command : "";
    const mode = tool === "PowerShell" ? "powershell" : "bash";
    return checkShellCommand(command, { ...ctx, mode });
  }
  return null;
}
