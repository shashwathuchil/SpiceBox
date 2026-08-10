import { useState, useEffect, useCallback } from "react";
import type { Recipe } from "../types/recipe";

const FAVORITES_KEY = "smart-pantry-favorites";

export function useFavorites() {
  const [saved, setSaved] = useState<Recipe[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSaved(parsed);
        }
      }
    } catch {
      setSaved([]);
    }
  }, []);

  const saveToStorage = useCallback((recipes: Recipe[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(recipes));
    } catch (e) {
      console.error("Failed to save favorites:", e);
    }
  }, []);

  const isFavorite = useCallback(
    (id: string) => saved.some((r) => r.id === id),
    [saved]
  );

  const addFavorite = useCallback(
    (recipe: Recipe) => {
      setSaved((prev) => {
        if (prev.some((r) => r.id === recipe.id)) return prev;
        const next = [recipe, ...prev];
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage]
  );

  const removeFavorite = useCallback(
    (id: string) => {
      setSaved((prev) => {
        const next = prev.filter((r) => r.id !== id);
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage]
  );

  const toggleFavorite = useCallback(
    (recipe: Recipe) => {
      const alreadySaved = saved.some((r) => r.id === recipe.id);
      if (alreadySaved) {
        removeFavorite(recipe.id);
        return false;
      }
      addFavorite(recipe);
      return true;
    },
    [saved, addFavorite, removeFavorite]
  );

  return { saved, isFavorite, addFavorite, removeFavorite, toggleFavorite };
}
