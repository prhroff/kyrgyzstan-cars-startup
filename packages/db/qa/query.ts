/** Pure helpers for the read-only data-QA runner (`pnpm --filter @repo/db qa`). */

export interface Finding {
  listing_id: string;
  problem: string;
  details: string;
}

export interface QaSummary {
  sampleSize: number;
  withProblems: number;
  percent: number;
  byProblem: Record<string, number>;
  examples: Finding[];
}

const FORBIDDEN =
  /\b(insert|update|delete|merge|truncate|drop|alter|create|grant|revoke|copy|call|do|vacuum|reindex|cluster|refresh|lock|set|reset|comment|security|listen|notify)\b/i;

/** Removes SQL comments and string literals so keyword checks don't trip on them. */
// One pass, leftmost match wins: `--` inside a literal stays a literal, a quote inside a comment
// stays a comment. Covers '…' (incl. E'…'), $$…$$ / $tag$…$tag$, -- and /* */.
const LITERAL_OR_COMMENT =
  /'(?:[^'\\]|''|\\.)*'|\$(\w*)\$[\s\S]*?\$\1\$|--[^\n]*|\/\*[\s\S]*?\*\//g;

function stripCommentsAndStrings(sql: string): string {
  return sql.replace(LITERAL_OR_COMMENT, (token) =>
    token.startsWith("'") || token.startsWith("$") ? "''" : " ",
  );
}

/**
 * Throws unless `sql` is a single SELECT/WITH statement without write keywords.
 * Defence in depth: the runner also executes everything inside `BEGIN READ ONLY`.
 */
export function assertReadOnlySql(sql: string): void {
  const code = stripCommentsAndStrings(sql).trim().replace(/;\s*$/, "");
  if (code.length === 0) throw new Error("QA query is empty");
  if (code.includes(";")) throw new Error("QA query must be a single statement");
  if (!/^(select|with)\b/i.test(code)) throw new Error("QA query must start with SELECT or WITH");
  const match = FORBIDDEN.exec(code);
  if (match) throw new Error(`QA query contains forbidden keyword: ${match[0]}`);
}

/** Exposes the sample as relation `sample` to a check query. */
export function buildCheckQuery(sampleSql: string, checkSql: string): string {
  const sample = stripTrailingSemicolon(sampleSql);
  const check = stripTrailingSemicolon(checkSql);
  const cte = `WITH sample AS (\n${sample}\n)`;
  const withPrefix = /^(\s*(?:--[^\n]*\n\s*)*)with\b/i;
  if (withPrefix.test(check)) return check.replace(withPrefix, `$1${cte},`);
  return `${cte}\n${check}`;
}

function stripTrailingSemicolon(sql: string): string {
  return sql.trim().replace(/;\s*$/, "");
}

/** Aggregates findings over the sample; examples prefer distinct problem types. */
export function summarize(sampleSize: number, findings: Finding[], exampleCount = 5): QaSummary {
  const byProblem: Record<string, number> = {};
  for (const finding of findings)
    byProblem[finding.problem] = (byProblem[finding.problem] ?? 0) + 1;

  const withProblems = new Set(findings.map((finding) => finding.listing_id)).size;
  const percent = sampleSize === 0 ? 0 : Math.round((withProblems / sampleSize) * 100);

  const examples: Finding[] = [];
  const seenProblems = new Set<string>();
  for (const finding of findings) {
    if (examples.length >= exampleCount) break;
    if (seenProblems.has(finding.problem)) continue;
    seenProblems.add(finding.problem);
    examples.push(finding);
  }
  for (const finding of findings) {
    if (examples.length >= exampleCount) break;
    if (!examples.includes(finding)) examples.push(finding);
  }

  return { sampleSize, withProblems, percent, byProblem, examples };
}

/** Masks credentials in connection strings inside error messages. */
export function maskSecrets(text: string): string {
  return text.replace(/(\w+:\/\/)[^@\s/]+@/g, "$1***@");
}
