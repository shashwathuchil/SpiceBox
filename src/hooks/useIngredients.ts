import { useState, useEffect, useCallback, useRef } from "react";
import type { Ingredient } from "../types/ingredient";
import {
  getIngredients,
  addIngredient as storageAdd,
  addIngredients as storageAddMany,
  updateIngredient as storageUpdate,
  removeIngredient as storageRemove,
} from "../services/storageService";
import { generateId } from "../utils/normalizeIngredient";

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [version, setVersion] = useState(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const stored = getIngredients();
    setIngredients(stored);
    prevCountRef.current = stored.length;
  }, []);

  const addIngredient = useCallback(
    (data: Omit<Ingredient, "id" | "source" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newIngredient: Ingredient = {
        ...data,
        id: generateId(),
        source: "manual",
        createdAt: now,
        updatedAt: now,
      };
      const updated = storageAdd(newIngredient);
      setIngredients(updated);
      setVersion((v) => v + 1);
      return updated;
    },
    []
  );

  const addReceiptIngredients = useCallback(
    (items: Array<{ name: string; quantity: number | null; unit: string | null; price?: number | null }>) => {
      const now = new Date().toISOString();
      const newIngredients: Ingredient[] = items.map((item) => ({
        id: generateId(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price ?? null,
        source: "receipt" as const,
        createdAt: now,
        updatedAt: now,
      }));
      const updated = storageAddMany(newIngredients);
      setIngredients(updated);
      setVersion((v) => v + 1);
      return updated;
    },
    []
  );

  const updateIngredient = useCallback(
    (id: string, updates: Partial<Omit<Ingredient, "id" | "createdAt">>) => {
      const updated = storageUpdate(id, updates);
      setIngredients(updated);
      setVersion((v) => v + 1);
      return updated;
    },
    []
  );

  const removeIngredient = useCallback((id: string) => {
    const updated = storageRemove(id);
    setIngredients(updated);
    setVersion((v) => v + 1);
    return updated;
  }, []);

  return {
    ingredients,
    version,
    addIngredient,
    addReceiptIngredients,
    updateIngredient,
    removeIngredient,
  };
}
