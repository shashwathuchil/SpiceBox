import type { Ingredient } from "../types/ingredient";

const STORAGE_KEY = "smart-pantry-ingredients";
const RECIPES_KEY = "smart-pantry-recipes";
const RECIPES_TIMESTAMP_KEY = "smart-pantry-recipes-timestamp";

export function getIngredients(): Ingredient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Ingredient[];
  } catch {
    return [];
  }
}

export function saveIngredients(ingredients: Ingredient[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
  } catch (e) {
    console.error("Failed to save ingredients:", e);
  }
}

export function addIngredient(ingredient: Ingredient): Ingredient[] {
  const ingredients = getIngredients();
  ingredients.push(ingredient);
  saveIngredients(ingredients);
  return ingredients;
}

export function addIngredients(newItems: Ingredient[]): Ingredient[] {
  const ingredients = getIngredients();
  const combined = [...ingredients, ...newItems];
  saveIngredients(combined);
  return combined;
}

export function updateIngredient(
  id: string,
  updates: Partial<Omit<Ingredient, "id" | "createdAt">>
): Ingredient[] {
  const ingredients = getIngredients();
  const index = ingredients.findIndex((ing) => ing.id === id);
  if (index === -1) return ingredients;
  ingredients[index] = {
    ...ingredients[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveIngredients(ingredients);
  return ingredients;
}

export function removeIngredient(id: string): Ingredient[] {
  const ingredients = getIngredients().filter((ing) => ing.id !== id);
  saveIngredients(ingredients);
  return ingredients;
}

export function clearIngredients(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Optional: persist last generated recipes
export function getCachedRecipes<T>(): { recipes: T; timestamp: string } | null {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    const ts = localStorage.getItem(RECIPES_TIMESTAMP_KEY);
    if (!raw) return null;
    return { recipes: JSON.parse(raw), timestamp: ts || "" };
  } catch {
    return null;
  }
}

export function saveCachedRecipes(recipes: unknown): void {
  try {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    localStorage.setItem(RECIPES_TIMESTAMP_KEY, new Date().toISOString());
  } catch (e) {
    console.error("Failed to cache recipes:", e);
  }
}
