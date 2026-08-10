import type { Recipe } from "../types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onClick: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  Intercontinental: "bg-blue-50 text-blue-700 border-blue-200",
  "South Indian": "bg-orange-50 text-orange-700 border-orange-200",
  "North Indian": "bg-purple-50 text-purple-700 border-purple-200",
};

const CATEGORY_ICONS: Record<string, string> = {
  Intercontinental: "🌎",
  "South Indian": "🍛",
  "North Indian": "🍽️",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "text-green-600 bg-green-50",
  Medium: "text-yellow-600 bg-yellow-50",
  Hard: "text-red-600 bg-red-50",
};

export function RecipeCard({ recipe, isFavorite, onClick, onToggleFavorite }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;
  const categoryStyle = CATEGORY_STYLES[recipe.category] || CATEGORY_STYLES["Intercontinental"];
  const categoryIcon = CATEGORY_ICONS[recipe.category] || "🍴";
  const difficultyStyle = DIFFICULTY_STYLES[recipe.difficulty] || DIFFICULTY_STYLES["Easy"];

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(recipe);
  };

  return (
    <div
      onClick={() => onClick(recipe)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden text-left flex flex-col animate-slide-up hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Header band */}
      <div className="h-2 bg-gradient-to-r from-pantry-400 to-pantry-600" />

      <div className="relative p-4 flex flex-col flex-1">
        {/* Category badge */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
          <span
            className={`inline-flex items-center gap-1 max-w-full truncate text-[11px] font-semibold px-2 py-1 rounded-full border ${categoryStyle}`}
          >
            {categoryIcon} {recipe.category}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${difficultyStyle}`}>
            {recipe.difficulty}
          </span>
        </div>

        {/* Recipe name */}
        <h3 className="font-bold text-gray-800 text-base leading-snug mb-1.5 line-clamp-2">
          {recipe.name}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
          {recipe.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
          <div className="bg-gray-50 rounded-lg py-1.5 px-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Time</p>
            <p className="text-xs font-bold text-gray-700 truncate">⏱ {totalTime}m</p>
          </div>
          <div className="bg-gray-50 rounded-lg py-1.5 px-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Serves</p>
            <p className="text-xs font-bold text-gray-700 truncate">🍽 {recipe.servings}</p>
          </div>
          <div className="bg-gray-50 rounded-lg py-1.5 px-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Items</p>
            <p className="text-xs font-bold text-gray-700 truncate">{recipe.availableIngredients.length}</p>
          </div>
        </div>

        {/* Ingredient availability */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] mb-3">
          <span className="flex items-center gap-1 text-green-600 font-medium whitespace-nowrap">
            ✓ {recipe.availableIngredients.length} available
          </span>
          {recipe.missingIngredients.length > 0 && (
            <span className="flex items-center gap-1 text-orange-500 font-medium whitespace-nowrap">
              ! {recipe.missingIngredients.length} missing
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <span className="text-pantry-600 text-sm font-semibold group-hover:text-pantry-700 transition-colors flex items-center justify-center gap-1">
            View Recipe
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Favorite button */}
      <button
        type="button"
        onClick={handleFavorite}
        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
          isFavorite
            ? "bg-red-50 text-red-500"
            : "bg-white/90 text-gray-400 hover:text-red-500"
        }`}
        aria-label={isFavorite ? "Remove from saved recipes" : "Save recipe"}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}
