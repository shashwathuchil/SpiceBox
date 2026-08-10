import { useState, useEffect } from "react";
import type { Ingredient } from "../types/ingredient";

interface IngredientFormProps {
  ingredient?: Ingredient | null;
  onSave: (data: {
    name: string;
    quantity: number | null;
    unit: string | null;
  }) => void;
  onCancel: () => void;
}

export function IngredientForm({
  ingredient,
  onSave,
  onCancel,
}: IngredientFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setQuantity(ingredient.quantity !== null ? String(ingredient.quantity) : "");
      setUnit(ingredient.unit || "");
    }
  }, [ingredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Ingredient name is required";
    }

    const qtyNum = quantity.trim() === "" ? null : parseFloat(quantity);
    if (quantity.trim() !== "" && (isNaN(qtyNum!) || qtyNum! < 0)) {
      newErrors.quantity = "Enter a valid quantity";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: name.trim(),
      quantity: qtyNum,
      unit: unit.trim() || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {ingredient ? "Edit Ingredient" : "Add Ingredient"}
        </h2>
        <p className="text-gray-500 text-sm mb-5">
          {ingredient
            ? "Update the ingredient details"
            : "Add a new ingredient to your pantry"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ingredient Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Potato"
              autoFocus
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pantry-500/30 focus:border-pantry-400 focus:bg-white transition-all"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantity
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 1"
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pantry-500/30 focus:border-pantry-400 focus:bg-white transition-all"
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. kg"
                list="common-units"
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pantry-500/30 focus:border-pantry-400 focus:bg-white transition-all"
              />
              <datalist id="common-units">
                <option value="kg" />
                <option value="g" />
                <option value="piece" />
                <option value="L" />
                <option value="ml" />
                <option value="dozen" />
                <option value="pack" />
                <option value="bunch" />
              </datalist>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-sm font-semibold text-white bg-pantry-600 hover:bg-pantry-700 rounded-xl transition-colors"
            >
              {ingredient ? "Update" : "Add to Pantry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
