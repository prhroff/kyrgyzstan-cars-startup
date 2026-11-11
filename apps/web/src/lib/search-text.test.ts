import { describe, expect, it } from "vitest";
import type { MakeOptionData } from "@/data/search";
import { resolveSearchText } from "./search-text";

const makes: MakeOptionData[] = [
  {
    id: "toyota",
    label: "Toyota",
    models: [
      { id: "toyota:camry", label: "Camry" },
      { id: "toyota:rav4", label: "RAV4" },
    ],
  },
  { id: "kia", label: "Kia", models: [{ id: "kia:k5", label: "K5" }] },
  { id: "li-auto", label: "Li Auto", models: [{ id: "li-auto:l7", label: "L7" }] },
];

describe("resolveSearchText", () => {
  it("make + model in any case", () => {
    expect(resolveSearchText("  toyota  CAMRY ", makes)).toEqual({
      kind: "model",
      make: "toyota",
      model: "toyota:camry",
    });
  });

  it("multi-word make", () => {
    expect(resolveSearchText("Li Auto L7", makes)).toMatchObject({
      make: "li-auto",
      model: "li-auto:l7",
    });
  });

  it("make only", () => {
    expect(resolveSearchText("kia", makes)).toEqual({ kind: "make", make: "kia" });
  });

  it("unique model without make", () => {
    expect(resolveSearchText("rav4", makes)).toEqual({
      kind: "model",
      make: "toyota",
      model: "toyota:rav4",
    });
  });

  it("no guessing: partial words stay free text", () => {
    expect(resolveSearchText("toyo", makes)).toEqual({ kind: "text", q: "toyo" });
    expect(resolveSearchText("камри гибрид", makes)).toEqual({ kind: "text", q: "камри гибрид" });
  });

  it("empty input", () => {
    expect(resolveSearchText("   ", makes)).toEqual({ kind: "empty" });
  });
});
