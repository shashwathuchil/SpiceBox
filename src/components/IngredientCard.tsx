import type { Ingredient } from "../types/ingredient";

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onRemove: (id: string) => void;
}

export function IngredientCard({
  ingredient,
  onEdit,
  onRemove,
}: IngredientCardProps) {
  const formatQuantity = () => {
    if (ingredient.quantity === null) return "—";
    const unit = ingredient.unit || "";
    return `${ingredient.quantity} ${unit}`.trim();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between gap-3 hover:shadow-md transition-shadow animate-slide-up">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-2 h-10 rounded-full flex-shrink-0 ${
            ingredient.source === "receipt" ? "bg-pantry-400" : "bg-blue-400"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {ingredient.name}
          </p>
          <p className="text-gray-500 text-xs">{formatQuantity()}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(ingredient)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label="Edit ingredient"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onRemove(ingredient.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Remove ingredient"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
