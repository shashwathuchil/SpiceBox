import { useState, useEffect, useRef, useCallback } from "react";
import type { Ingredient } from "../types/ingredient";
import type { Recipe, CourseType } from "../types/recipe";
import { generateRecipes } from "../services/recipeService";
import { hasApiKey } from "../services/groqService";
import { getCachedRecipes, saveCachedRecipes } from "../services/storageService";

const DEBOUNCE_MS = 1200;

export function useRecipes(
  ingredients: Ingredient[],
  version: number,
  course: CourseType = "Any"
) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // Load cached recipes on mount
  useEffect(() => {
    const cached = getCachedRecipes<Recipe[]>();
    if (cached && cached.recipes.length > 0) {
      setRecipes(cached.recipes);
      setHasGenerated(true);
    }
  }, []);

  const fetchRecipes = useCallback(
    async (ings: Ingredient[], selectedCourse: CourseType) => {
      if (ings.length === 0) {
        setRecipes([]);
        setHasGenerated(false);
        setLoading(false);
        return;
      }

      if (!hasApiKey()) {
        setLoading(false);
        setError(
          "Groq API key is not configured. Enter it in Settings or set it in localStorage under 'spicebox-groq-api-key'."
        );
        return;
      }

      const currentRequestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const result = await generateRecipes(ings, selectedCourse);
        // Only update if this is still the latest request
        if (currentRequestId === requestIdRef.current) {
          setRecipes(result);
          setHasGenerated(true);
          saveCachedRecipes(result);
        }
      } catch (e) {
        if (currentRequestId === requestIdRef.current) {
          const message =
            e instanceof Error ? e.message : "Failed to generate recipes.";
          setError(message);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Debounced auto-fetch when ingredients change
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (ingredients.length === 0) {
      setRecipes([]);
      setHasGenerated(false);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    timerRef.current = setTimeout(() => {
      fetchRecipes(ingredients, course);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, course]);

  const refreshRecipes = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    fetchRecipes(ingredients, course);
  }, [ingredients, course, fetchRecipes]);

  /** Replaces a single recipe in place (used by AI recipe edits). */
  const updateRecipe = useCallback((updated: Recipe) => {
    setRecipes((prev) => {
      const next = prev.map((r) => (r.id === updated.id ? updated : r));
      saveCachedRecipes(next);
      return next;
    });
  }, []);

  return {
    recipes,
    loading,
    error,
    hasGenerated,
    refreshRecipes,
    updateRecipe,
  };
}
