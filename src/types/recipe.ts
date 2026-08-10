export type RecipeCategory = "Intercontinental" | "South Indian" | "North Indian";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type CourseType = "Any" | "Starter" | "Main Course" | "Dessert";

export const COURSE_OPTIONS: CourseType[] = [
  "Any",
  "Starter",
  "Main Course",
  "Dessert",
];

export interface RecipeIngredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  description: string;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  servings: number;
  availableIngredients: RecipeIngredient[];
  missingIngredients: string[];
  ingredients: string[];
  steps: string[];
  tips: string[];
}

export interface RecipeResponse {
  recipes: Recipe[];
}

/**
 * Outcome of an AI query about a single recipe.
 * - "answer"   : recipe-related question answered, recipe unchanged
 * - "proposed" : the AI suggests a recipe modification and is waiting for user confirmation
 * - "updated"  : the recipe was modified per the user's request
 * - "rejected" : the question was outside the allowed recipe scope
 */
export type RecipeQueryStatus = "answer" | "proposed" | "updated" | "rejected";

export interface RecipeQueryResult {
  status: RecipeQueryStatus;
  answer: string;
  recipe: Recipe | null;
}

export interface RecipeChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: RecipeQueryStatus;
  proposedRecipe?: Recipe;
}
