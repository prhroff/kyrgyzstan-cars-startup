// PreToolUse hook: blocks reading/editing env files and other secret files.
// Exit code 2 blocks the tool call; stderr is shown to Claude as the reason.
import { readFileSync } from "node:fs";

// .env, .env.local, .env.production… — but not .env.example. Plus keys, certificates, credential stores.
const SECRET_PATH =
  /(^|[\\/])(\.env(\.(?!example$)[^\\/]+)?|[^\\/]+\.(pem|key|p12|pfx)|id_(rsa|ecdsa|ed25519)|credentials\.json|\.pgpass|\.netrc|\.npmrc)$/i;

// The same names as tokens inside a shell command (cat .env.local, Get-Content E:\x\.env, …).
const SECRET_IN_COMMAND =
  /(^|[\s'"=:\\/<>|;&(])(\.env(\.(?!example\b)[\w.-]+)?|[\w.-]+\.(pem|p12|pfx)|id_(rsa|ecdsa|ed25519)|credentials\.json|\.pgpass|\.netrc)(?=$|[\s'"\\/;&|)>])/i;

function block(reason) {
  process.stderr.write(
    `Заблокировано хуком protect-secrets: ${reason}. Секреты (.env*, ключи) не читаются и не правятся; ` +
      "нужна переменная — проверь .env.example и zod-схему env.\n",
  );
  process.exit(2);
}

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0); // Not our business to break tools on malformed input.
}

const tool = input.tool_name ?? "";
const args = input.tool_input ?? {};

if (["Read", "Edit", "Write", "MultiEdit", "NotebookEdit", "Grep", "Glob"].includes(tool)) {
  for (const key of ["file_path", "notebook_path", "path"]) {
    const value = args[key];
    if (typeof value === "string" && SECRET_PATH.test(value.trim())) block(`${tool} ${value}`);
  }
  if (tool === "Grep" && typeof args.glob === "string" && /\.env(?!\.example)/i.test(args.glob)) {
    block(`Grep glob ${args.glob}`);
  }
}

if (tool === "Bash" || tool === "PowerShell") {
  const command = typeof args.command === "string" ? args.command : "";
  const match = SECRET_IN_COMMAND.exec(command);
  if (match) block(`команда обращается к ${match[2]}`);
}

process.exit(0);
