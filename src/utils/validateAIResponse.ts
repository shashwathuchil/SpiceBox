import type {
  Recipe,
  RecipeCategory,
  Difficulty,
  RecipeQueryResult,
} from "../types/recipe";
import type { ReceiptExtractionResult } from "../types/receipt";

const VALID_CATEGORIES: RecipeCategory[] = [
  "Intercontinental",
  "South Indian",
  "North Indian",
];

const VALID_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

/**
 * Strips markdown code fences (```json ... ```) from a string.
 */
export function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  // Remove leading ```json or ``` and trailing ```
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  return cleaned.trim();
}

/**
 * Safely parses JSON, stripping code fences first.
 */
export function safeJsonParse<T>(text: string): T {
  const cleaned = stripCodeFences(text);
  return JSON.parse(cleaned) as T;
}

function asString(val: unknown): string {
  if (typeof val === "string") return val;
  if (val === null || val === undefined) return "";
  const str = String(val);
  // An object coerced to a string becomes the literal "[object Object]".
  // Treat that as invalid/empty instead of rendering it in the UI.
  return str === "[object Object]" ? "" : str;
}

function asNumberOrNull(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function asNumber(val: unknown, fallback: number): number {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

function asStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((v): v is string => typeof v === "string")
    .filter((s) => s.length > 0);
}

function asRecipeIngredientArray(
  val: unknown
): { name: string; quantity: string }[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter(
      (v): v is Record<string, unknown> =>
        v !== null && typeof v === "object" && !Array.isArray(v)
    )
    .map((v) => ({
      name: asString(v.name),
      quantity: asString(v.quantity),
    }))
    .filter((item) => item.name.length > 0);
}

function normalizeCategory(val: unknown): RecipeCategory {
  const s = asString(val).trim();
  const match = VALID_CATEGORIES.find(
    (c) => c.toLowerCase() === s.toLowerCase()
  );
  return match ?? "Intercontinental";
}

function normalizeDifficulty(val: unknown): Difficulty {
  const s = asString(val).trim();
  const match = VALID_DIFFICULTIES.find(
    (d) => d.toLowerCase() === s.toLowerCase()
  );
  return match ?? "Easy";
}

/**
 * Validates and normalizes a recipe object from AI output.
 * Returns null if the recipe is invalid.
 */
function validateRecipe(raw: unknown): Recipe | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const name = asString(obj.name).trim();
  if (!name) return null;

  return {
    id: asString(obj.id) || `recipe-${Math.random().toString(36).slice(2, 11)}`,
    name,
    category: normalizeCategory(obj.category),
    description: asString(obj.description),
    prepTime: asNumber(obj.prepTime, 0),
    cookTime: asNumber(obj.cookTime, 0),
    difficulty: normalizeDifficulty(obj.difficulty),
    servings: Math.max(1, asNumber(obj.servings, 1)),
    availableIngredients: asRecipeIngredientArray(obj.availableIngredients),
    missingIngredients: asStringArray(obj.missingIngredients),
    ingredients: asStringArray(obj.ingredients),
    steps: asStringArray(obj.steps),
    tips: asStringArray(obj.tips),
  };
}

/**
 * Validates the full recipe response from Groq.
 * Returns an empty array if no valid recipes found.
 */
export function validateRecipeResponse(text: string): Recipe[] {
  try {
    const parsed = safeJsonParse<{ recipes?: unknown[] }>(text);
    if (!parsed.recipes || !Array.isArray(parsed.recipes)) return [];

    const recipes = parsed.recipes
      .map(validateRecipe)
      .filter((r): r is Recipe => r !== null);

    return recipes;
  } catch {
    return [];
  }
}

export const OUT_OF_SCOPE_MESSAGE =
  "I can only help with questions about this recipe and how to cook it.";

/**
 * Validates an AI response to a question about a single recipe.
 *
 * Fails closed: if the payload is malformed, or claims an update without a
 * usable recipe, the query is treated as unanswerable rather than silently
 * corrupting the recipe.
 */
export function validateRecipeQueryResponse(
  text: string,
  originalRecipe: Recipe
): RecipeQueryResult {
  let parsed: Record<string, unknown>;
  try {
    parsed = safeJsonParse<Record<string, unknown>>(text);
  } catch {
    return {
      status: "rejected",
      answer:
        "Sorry, I could not understand that. Please rephrase your question about this recipe.",
      recipe: null,
    };
  }

  const rawStatus = asString(parsed.status).trim().toLowerCase();
  const answer = asString(parsed.answer).trim();

  if (rawStatus === "rejected") {
    return {
      status: "rejected",
      answer: answer || OUT_OF_SCOPE_MESSAGE,
      recipe: null,
    };
  }

  if (rawStatus === "proposed" || rawStatus === "updated") {
    const updated = validateRecipe(parsed.recipe);
    if (!updated) {
      return {
        status: "answer",
        answer:
          answer ||
          "I could not apply that change reliably. Please try rewording your request.",
        recipe: null,
      };
    }
    return {
      status: rawStatus as "proposed" | "updated",
      // Preserve identity so the recipe can be matched in the existing list.
      recipe: { ...updated, id: originalRecipe.id },
      answer:
        answer ||
        (rawStatus === "proposed"
          ? "I've suggested a change to this recipe."
          : "I've updated the recipe for you."),
    };
  }

  if (rawStatus === "answer" && answer) {
    return { status: "answer", answer, recipe: null };
  }

  // Unknown status or empty answer -> fail closed.
  return {
    status: "rejected",
    answer: answer || OUT_OF_SCOPE_MESSAGE,
    recipe: null,
  };
}

/**
 * Validates the receipt extraction response from Groq.
 * Returns an empty array if no valid items found.
 */
export function validateReceiptResponse(
  text: string
): ReceiptExtractionResult["items"] {
  try {
    const parsed = safeJsonParse<ReceiptExtractionResult>(text);
    if (!parsed.items || !Array.isArray(parsed.items)) return [];

    return parsed.items
      .filter(
        (v) => v !== null && typeof v === "object"
      )
      .map((raw) => {
        const item = raw as unknown as Record<string, unknown>;
        return {
          name: asString(item.name).trim(),
          quantity: asNumberOrNull(item.quantity),
          unit: item.unit ? asString(item.unit) : null,
          price: asNumberOrNull(item.price),
        };
      })
      .filter((item) => item.name.length > 0);
  } catch {
    return [];
  }
}
