import type { Recipe, CourseType, RecipeQueryResult } from "../types/recipe";
import type { Ingredient } from "../types/ingredient";
import { generateRecipesRaw, askAboutRecipeRaw } from "./groqService";
import {
  validateRecipeResponse,
  validateRecipeQueryResponse,
} from "../utils/validateAIResponse";

/** Max characters accepted for a single recipe question. */
export const MAX_QUESTION_LENGTH = 500;

/**
 * Asks the AI a question about a single recipe, optionally modifying it to
 * suit the user's needs and available ingredients.
 *
 * The prompt is hard-scoped to recipe topics and the response is validated,
 * so out-of-scope questions come back as status "rejected".
 */
export async function askAboutRecipe(
  recipe: Recipe,
  ingredients: Ingredient[],
  question: string
): Promise<RecipeQueryResult> {
  const trimmed = question.trim();

  if (!trimmed) {
    return {
      status: "rejected",
      answer: "Please enter a question about this recipe.",
      recipe: null,
    };
  }

  const pantry = ingredients.map((ing) => ({
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
  }));

  const rawText = await askAboutRecipeRaw(
    recipe,
    pantry,
    trimmed.slice(0, MAX_QUESTION_LENGTH)
  );

  return validateRecipeQueryResponse(rawText, recipe);
}

/**
 * Generates recipe recommendations from the current pantry ingredients.
 * Returns validated Recipe[].
 */
export async function generateRecipes(
  ingredients: Ingredient[],
  course: CourseType = "Any"
): Promise<Recipe[]> {
  if (ingredients.length === 0) return [];

  const payload = ingredients.map((ing) => ({
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
  }));

  const rawText = await generateRecipesRaw(payload, course);
  const recipes = validateRecipeResponse(rawText);

  if (recipes.length === 0) {
    throw new Error(
      "The AI could not generate valid recipes. Please try again or add more ingredients."
    );
  }

  return recipes;
}
