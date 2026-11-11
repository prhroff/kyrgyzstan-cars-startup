// PreToolUse hook: precise guard for secret files and secret env vars (rules in secret-guard.mjs).
// Exit code 2 blocks the tool call; stderr is shown to Claude as the reason.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { checkToolCall } from "./secret-guard.mjs";

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0); // Malformed payload: don't break tools.
}

const cwd = input.cwd ?? process.cwd();
// Git Bash paths (/e/startup-project/…) → E:/startup-project/… for Node on Windows.
const toNative = (p) =>
  process.platform === "win32" ? p.replace(/^\/([a-zA-Z])(?=\/|$)/, "$1:") : p;
const resolve = (p) => path.resolve(cwd, toNative(p));

const reason = checkToolCall(input, {
  exists: (p) => existsSync(resolve(p)),
  list: (dir) => {
    try {
      return readdirSync(resolve(dir));
    } catch {
      return [];
    }
  },
});

if (reason) {
  process.stderr.write(
    `Заблокировано хуком protect-secrets: ${reason}. Содержимое секретов (.env*, ключи) не читается, ` +
      "не выводится и не правится; упоминать .env в тексте и запускать программы проекта можно.\n",
  );
  process.exit(2);
}
process.exit(0);
