import type { MakeOptionData } from "@/data/search";
import { normalizeText } from "@/data/search";

export type ResolvedSearch =
  | { kind: "model"; make: string; model: string }
  | { kind: "make"; make: string }
  | { kind: "text"; q: string }
  | { kind: "empty" };

/**
 * Header search: "toyota camry" → make + model filters, "camry" → its make + model,
 * "toyota" → make; anything else stays free text (q). Exact words only — no fuzzy guessing,
 * so a filter is never set on a guess.
 */
export function resolveSearchText(text: string, makes: readonly MakeOptionData[]): ResolvedSearch {
  const q = normalizeText(text);
  if (q === "") return { kind: "empty" };
  const has = (label: string) => {
    const l = normalizeText(label);
    return q === l || q.startsWith(`${l} `) || q.endsWith(` ${l}`) || q.includes(` ${l} `);
  };

  for (const make of makes) {
    if (!has(make.label)) continue;
    const model = make.models.find((m) => has(m.label));
    return model
      ? { kind: "model", make: make.id, model: model.id }
      : { kind: "make", make: make.id };
  }
  // Model without make: only when the model name is unique across makes.
  const byModel = makes.flatMap((mk) =>
    mk.models
      .filter((m) => normalizeText(m.label) === q)
      .map((m) => ({ make: mk.id, model: m.id })),
  );
  const [only, ...rest] = byModel;
  if (only && rest.length === 0) return { kind: "model", ...only };
  return { kind: "text", q: text.trim() };
}
