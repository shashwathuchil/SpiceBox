/**
 * Normalizes an ingredient name to a clean, title-cased form.
 */
export function normalizeIngredientName(name: string): string {
  if (!name) return "";
  const trimmed = name.trim().replace(/\s+/g, " ");
  return trimmed
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Normalizes a unit string to a common abbreviation.
 */
export function normalizeUnit(unit: string | null): string | null {
  if (!unit) return null;
  const u = unit.trim().toLowerCase();
  const unitMap: Record<string, string> = {
    kg: "kg",
    kilogram: "kg",
    kilograms: "kg",
    g: "g",
    gram: "g",
    grams: "g",
    gm: "g",
    gr: "g",
    pc: "piece",
    pcs: "piece",
    piece: "piece",
    pieces: "piece",
    nos: "piece",
    no: "piece",
    l: "L",
    litre: "L",
    liter: "L",
    litres: "L",
    liters: "L",
    ml: "ml",
    millilitre: "ml",
    milliliter: "ml",
    dozen: "dozen",
    dz: "dozen",
    pack: "pack",
    packet: "pack",
    pkt: "pack",
    bunch: "bunch",
    bunches: "bunch",
  };
  return unitMap[u] ?? u;
}

/**
 * Generates a unique ID for an ingredient.
 */
export function generateId(): string {
  return `ing-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
