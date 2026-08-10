import type { Recipe } from "../types/recipe";
import { RecipeCard } from "./RecipeCard";

interface RecipeGridProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (recipe: Recipe) => void;
}

const CATEGORY_ORDER = ["Intercontinental", "South Indian", "North Indian"] as const;
const CATEGORY_HEADERS: Record<string, string> = {
  Intercontinental: "🌎 Intercontinental",
  "South Indian": "🍛 South Indian",
  "North Indian": "🍽️ North Indian",
};

export function RecipeGrid({ recipes, onRecipeClick, isFavorite, onToggleFavorite }: RecipeGridProps) {
  // Group recipes by category
  const grouped = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = recipes.filter((r) => r.category === category);
    return acc;
  }, {} as Record<string, Recipe[]>);

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map((category) => {
        const categoryRecipes = grouped[category];
        if (!categoryRecipes || categoryRecipes.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              {CATEGORY_HEADERS[category]}
              <span className="text-gray-400 font-normal">({categoryRecipes.length})</span>
            </h3>
            <div className="grid grid-cols-1 min-[430px]:grid-cols-2 gap-3 sm:gap-4">
              {categoryRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={isFavorite(recipe.id)}
                  onClick={onRecipeClick}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
