/** "Mercedes-Benz" → "mercedes-benz", "ID.4" → "id-4", "Land Cruiser Prado" → "land-cruiser-prado". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
