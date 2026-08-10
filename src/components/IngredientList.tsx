import { useState, useMemo } from "react";
import type { Ingredient } from "../types/ingredient";
import { IngredientCard } from "./IngredientCard";

interface IngredientListProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onRemove: (id: string) => void;
}

export function IngredientList({
  ingredients,
  onEdit,
  onRemove,
}: IngredientListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return ingredients;
    const q = search.toLowerCase();
    return ingredients.filter((ing) =>
      ing.name.toLowerCase().includes(q)
    );
  }, [ingredients, search]);

  if (ingredients.length === 0) return null;

  return (
    <div className="space-y-3">
      {ingredients.length > 6 && (
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredients..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pantry-500/30 focus:border-pantry-400 transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          No ingredients match "{search}"
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filtered.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
