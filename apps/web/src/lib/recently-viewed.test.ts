import { describe, expect, it } from "vitest";
import { addViewed, parseViewed, RECENTLY_VIEWED_MAX, sanitizeViewedIds } from "./recently-viewed";

describe("recently viewed", () => {
  it("parses only a list of strings, otherwise empty", () => {
    expect(parseViewed(null)).toEqual([]);
    expect(parseViewed("not json")).toEqual([]);
    expect(parseViewed('{"a":1}')).toEqual([]);
    expect(parseViewed('["a", 1, "", "b", "a"]')).toEqual(["a", "b"]);
  });

  it("adds to the front without duplicates, capped", () => {
    expect(addViewed(["a", "b"], "b")).toEqual(["b", "a"]);
    const many = Array.from({ length: RECENTLY_VIEWED_MAX }, (_, i) => `id${i}`);
    const next = addViewed(many, "new");
    expect(next).toHaveLength(RECENTLY_VIEWED_MAX);
    expect(next[0]).toBe("new");
    expect(next).not.toContain(`id${RECENTLY_VIEWED_MAX - 1}`);
  });
});

describe("sanitizeViewedIds", () => {
  it("accepts only an array of sane strings, capped", () => {
    expect(sanitizeViewedIds("demo-ok")).toEqual([]);
    expect(sanitizeViewedIds(null)).toEqual([]);
    expect(sanitizeViewedIds(["a", 5, "", "x".repeat(65), { id: "b" }, "c"])).toEqual(["a", "c"]);
    const many = Array.from({ length: 20 }, (_, i) => `id${i}`);
    expect(sanitizeViewedIds(many)).toHaveLength(RECENTLY_VIEWED_MAX);
  });
});
