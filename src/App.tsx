import { useState, useCallback } from "react";
import { useIngredients } from "./hooks/useIngredients";
import { useRecipes } from "./hooks/useRecipes";
import type { Ingredient } from "./types/ingredient";
import type { Recipe, CourseType } from "./types/recipe";
import { COURSE_OPTIONS } from "./types/recipe";
import type { ReceiptItem } from "./types/receipt";
import { BarcodeScanner } from "./components/BarcodeScanner";
import { ReceiptCapture } from "./components/ReceiptCapture";
import { ReceiptConfirmation } from "./components/ReceiptConfirmation";
import { IngredientList } from "./components/IngredientList";
import { IngredientForm } from "./components/IngredientForm";
import { RecipeGrid } from "./components/RecipeGrid";
import { RecipeModal } from "./components/RecipeModal";
import { Sidebar } from "./components/Sidebar";
import { Settings } from "./components/Settings";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";
import { useFavorites } from "./hooks/useFavorites";

type ScanStep = "idle" | "barcode" | "capture" | "confirm";

const COURSE_LABELS: Record<CourseType, string> = {
  Any: "🍴 Anything",
  Starter: "🥗 Starter",
  "Main Course": "🍛 Main Course",
  Dessert: "🍰 Dessert",
};

function App() {
  const {
    ingredients,
    version,
    addIngredient,
    addReceiptIngredients,
    updateIngredient,
    removeIngredient,
  } = useIngredients();

  const [course, setCourse] = useState<CourseType>("Any");

  const {
    recipes,
    loading,
    error,
    hasGenerated,
    refreshRecipes,
    updateRecipe,
  } = useRecipes(ingredients, version, course);

  const [scanStep, setScanStep] = useState<ScanStep>("idle");
  const [barcode, setBarcode] = useState<string | null>(null);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<"home" | "saved" | "settings">("home");

  const { saved, isFavorite, toggleFavorite } = useFavorites();

  const canGenerate = ingredients.length > 2;

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleToggleFavorite = useCallback(
    (recipe: Recipe) => {
      const added = toggleFavorite(recipe);
      if (added) {
        showToast("✓ Recipe saved");
      } else {
        showToast("Recipe removed from saved");
      }
    },
    [toggleFavorite, showToast]
  );

  const handleRecipeUpdate = useCallback(
    (updated: Recipe) => {
      updateRecipe(updated);
      // Keep the open modal in sync with the edited recipe.
      setSelectedRecipe(updated);
      showToast("✓ Recipe updated");
    },
    [updateRecipe, showToast]
  );

  const handleScanStart = useCallback(() => {
    setBarcode(null);
    setReceiptItems([]);
    setScanStep("barcode");
  }, []);

  const handleBarcodeDetected = useCallback((code: string) => {
    setBarcode(code);
    setScanStep("capture");
  }, []);

  const handleBarcodeSkip = useCallback(() => {
    setBarcode(null);
    setScanStep("capture");
  }, []);

  const handleReceiptExtracted = useCallback((items: ReceiptItem[]) => {
    setReceiptItems(items);
    setScanStep("confirm");
  }, []);

  const handleReceiptConfirm = useCallback(
    (items: ReceiptItem[]) => {
      addReceiptIngredients(items);
      setScanStep("idle");
      setReceiptItems([]);
      showToast(`✓ Added ${items.length} ingredients to your pantry`);
    },
    [addReceiptIngredients, showToast]
  );

  const handleScanCancel = useCallback(() => {
    setScanStep("idle");
    setBarcode(null);
    setReceiptItems([]);
  }, []);

  const handleAddIngredient = useCallback(
    (data: { name: string; quantity: number | null; unit: string | null }) => {
      if (editingIngredient) {
        updateIngredient(editingIngredient.id, data);
        setEditingIngredient(null);
        showToast("✓ Ingredient updated");
      } else {
        addIngredient(data);
        showToast("✓ Ingredient added to pantry");
      }
      setShowIngredientForm(false);
    },
    [addIngredient, updateIngredient, editingIngredient, showToast]
  );

  const handleEditIngredient = useCallback((ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setShowIngredientForm(true);
  }, []);

  const handleRemoveIngredient = useCallback(
    (id: string) => {
      removeIngredient(id);
      showToast("Ingredient removed");
    },
    [removeIngredient, showToast]
  );

  const handleCloseForm = useCallback(() => {
    setShowIngredientForm(false);
    setEditingIngredient(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 sm:pl-60">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-pantry-400 to-pantry-600 rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
              🧺
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-base leading-tight">
                SpiceBoxAi
              </h1>
              <p className="text-[11px] text-gray-400 leading-tight">
                Your ingredients → Your recipes
              </p>
            </div>
          </div>
          {ingredients.length > 0 && (
            <span className="text-xs font-semibold text-pantry-700 bg-pantry-50 px-3 py-1.5 rounded-full">
              {ingredients.length} {ingredients.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>
      </header>

      <Sidebar active={view} onChange={setView} savedCount={saved.length} />

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-6 pb-24 sm:pb-24">
        {view === "saved" ? (
          <section>
            <div className="mb-3">
              <h2 className="font-bold text-gray-800 text-base">Saved Recipes</h2>
              <p className="text-xs text-gray-400">
                {saved.length > 0
                  ? `${saved.length} saved recipe${saved.length === 1 ? "" : "s"}`
                  : "No saved recipes yet"}
              </p>
            </div>
            {saved.length > 0 ? (
              <RecipeGrid
                recipes={saved}
                onRecipeClick={setSelectedRecipe}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">❤️</div>
                <p className="text-gray-600 font-medium text-sm mb-1">
                  Your saved recipes will appear here
                </p>
                <p className="text-gray-400 text-xs mb-4">
                  Tap the heart on any recipe to save it.
                </p>
                <button
                  onClick={() => setView("home")}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-pantry-600 hover:bg-pantry-700 rounded-xl transition-colors"
                >
                  Browse recipes
                </button>
              </div>
            )}
          </section>
        ) : view === "settings" ? (
          <Settings />
        ) : ingredients.length === 0 ? (
          <EmptyState onScan={handleScanStart} onAdd={() => setShowIngredientForm(true)} />
        ) : (
          <>
            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleScanStart}
                className="py-3.5 text-sm font-semibold text-white bg-pantry-600 hover:bg-pantry-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                📷 Scan Receipt
              </button>
              <button
                onClick={() => setShowIngredientForm(true)}
                className="py-3.5 text-sm font-semibold text-pantry-700 bg-pantry-50 hover:bg-pantry-100 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                ➕ Add Ingredient
              </button>
            </div>

            {/* My Ingredients section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-gray-800 text-base">
                    My Ingredients
                  </h2>
                  <p className="text-xs text-gray-400">
                    {ingredients.length} {ingredients.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <IngredientList
                ingredients={ingredients}
                onEdit={handleEditIngredient}
                onRemove={handleRemoveIngredient}
              />
            </section>

            {/* Recommended Dishes section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-gray-800 text-base">
                    Recommended Dishes
                  </h2>
                  <p className="text-xs text-gray-400">
                    {loading
                      ? "Finding recipes for your pantry..."
                      : recipes.length > 0
                      ? `${recipes.length} recipes found`
                      : "Add ingredients to get recipes"}
                  </p>
                </div>
                {!loading && recipes.length > 0 && (
                  <button
                    onClick={refreshRecipes}
                    className="text-xs font-semibold text-pantry-600 hover:text-pantry-700 bg-pantry-50 hover:bg-pantry-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                  >
                    🔄 Refresh
                  </button>
                )}
              </div>

              {/* Course selector */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  What are you cooking?
                </p>
                <div
                  role="group"
                  aria-label="Course type"
                  className="flex flex-wrap gap-2"
                >
                  {COURSE_OPTIONS.map((option) => {
                    const active = course === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={active}
                        disabled={loading}
                        onClick={() => setCourse(option)}
                        className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          active
                            ? "bg-pantry-600 text-white border-pantry-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-pantry-300 hover:text-pantry-700"
                        }`}
                      >
                        {COURSE_LABELS[option]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipe content */}
              {loading ? (
                <LoadingState />
              ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-3">😕</div>
                  <p className="text-red-700 font-semibold text-sm mb-1">
                    Unable to generate recipes right now.
                  </p>
                  <p className="text-red-500 text-xs mb-4">{error}</p>
                  <button
                    onClick={refreshRecipes}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : recipes.length > 0 ? (
                <RecipeGrid
                  recipes={recipes}
                  onRecipeClick={setSelectedRecipe}
                  isFavorite={isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                />
              ) : hasGenerated ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                  <p className="text-gray-500 text-sm mb-4">
                    No recipes could be generated. Try adding more ingredients or
                    generating again.
                  </p>
                  <button
                    onClick={refreshRecipes}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-pantry-600 hover:bg-pantry-700 rounded-xl transition-colors"
                  >
                    ✨ Generate Recipes
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-pantry-50 to-blue-50 border border-pantry-100 rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">👨‍🍳</div>
                  {canGenerate ? (
                    <>
                      <p className="text-gray-600 font-medium text-sm mb-1">
                        Ready to cook something up?
                      </p>
                      <p className="text-gray-400 text-xs mb-4">
                        You have {ingredients.length} ingredients in your pantry.
                      </p>
                      <button
                        onClick={refreshRecipes}
                        className="px-5 py-3 text-sm font-semibold text-white bg-pantry-600 hover:bg-pantry-700 rounded-xl transition-colors shadow-sm"
                      >
                        ✨ Generate Recipes
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 font-medium text-sm mb-1">
                        Recipes will appear here automatically
                      </p>
                      <p className="text-gray-400 text-xs">
                        We're analyzing your ingredients and finding the best recipes...
                      </p>
                    </>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Scan flow overlays */}
      {scanStep === "barcode" && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onCancel={handleScanCancel}
          onSkip={handleBarcodeSkip}
        />
      )}

      {scanStep === "capture" && (
        <ReceiptCapture
          barcode={barcode}
          onExtracted={handleReceiptExtracted}
          onCancel={handleScanCancel}
          onBack={() => setScanStep("barcode")}
        />
      )}

      {scanStep === "confirm" && (
        <ReceiptConfirmation
          items={receiptItems}
          onConfirm={handleReceiptConfirm}
          onCancel={handleScanCancel}
        />
      )}

      {/* Ingredient form modal */}
      {showIngredientForm && (
        <IngredientForm
          ingredient={editingIngredient}
          onSave={handleAddIngredient}
          onCancel={handleCloseForm}
        />
      )}

      {/* Recipe detail modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          ingredients={ingredients}
          isFavorite={isFavorite(selectedRecipe.id)}
          onClose={() => setSelectedRecipe(null)}
          onRecipeUpdate={handleRecipeUpdate}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gray-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
