import { useEffect, useState, useRef, useCallback } from "react";
import type { Recipe, RecipeChatMessage } from "../types/recipe";
import type { Ingredient } from "../types/ingredient";
import { askAboutRecipe, MAX_QUESTION_LENGTH } from "../services/recipeService";

interface RecipeModalProps {
  recipe: Recipe;
  ingredients: Ingredient[];
  isFavorite: boolean;
  onClose: () => void;
  onRecipeUpdate: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
}

const SUGGESTED_QUESTIONS = [
  "Adapt this to only what I have",
  "Make it serve 6",
  "Can I substitute the missing items?",
  "Make it less spicy",
];

const CATEGORY_ICONS: Record<string, string> = {
  Intercontinental: "🌎",
  "South Indian": "🍛",
  "North Indian": "🍽️",
};

export function RecipeModal({
  recipe,
  ingredients,
  isFavorite,
  onClose,
  onRecipeUpdate,
  onToggleFavorite,
}: RecipeModalProps) {
  const [messages, setMessages] = useState<RecipeChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const handleProposal = useCallback(
    (messageId: string, accepted: boolean) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId || !msg.proposedRecipe) return msg;
          if (accepted) {
            onRecipeUpdate(msg.proposedRecipe);
            return {
              ...msg,
              status: "updated",
              proposedRecipe: undefined,
            };
          }
          return {
            ...msg,
            status: "rejected",
            content: `${msg.content}\n\nRecipe change not applied.`,
            proposedRecipe: undefined,
          };
        })
      );
    },
    [onRecipeUpdate]
  );

  const submitQuestion = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || asking) return;

      setQuestion("");
      setAskError(null);
      setAsking(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          role: "user",
          content: trimmed.slice(0, MAX_QUESTION_LENGTH),
        },
      ]);

      try {
        const result = await askAboutRecipe(recipe, ingredients, trimmed);

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: result.answer,
            status: result.status,
            proposedRecipe:
              result.status === "proposed" && result.recipe
                ? result.recipe
                : undefined,
          },
        ]);

        if (result.status === "updated" && result.recipe) {
          onRecipeUpdate(result.recipe);
        }
      } catch (e) {
        setAskError(
          e instanceof Error ? e.message : "Failed to reach the AI assistant."
        );
      } finally {
        setAsking(false);
      }
    },
    [recipe, ingredients, onRecipeUpdate, asking]
  );

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, asking]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const totalTime = recipe.prepTime + recipe.cookTime;
  const categoryIcon = CATEGORY_ICONS[recipe.category] || "🍴";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-pantry-500 to-pantry-700 text-white p-5 rounded-t-2xl z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full mb-2">
                {categoryIcon} {recipe.category}
              </span>
              <h2 className="text-xl font-bold leading-tight">{recipe.name}</h2>
              <p className="text-white/80 text-sm mt-1 line-clamp-2">{recipe.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onToggleFavorite(recipe)}
              className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                isFavorite
                  ? "text-red-100 hover:bg-white/20"
                  : "text-white/80 hover:text-red-100 hover:bg-white/20"
              }`}
              aria-label={isFavorite ? "Remove from saved recipes" : "Save recipe"}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Prep</p>
              <p className="text-sm font-bold text-gray-700">{recipe.prepTime}m</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Cook</p>
              <p className="text-sm font-bold text-gray-700">{recipe.cookTime}m</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Total</p>
              <p className="text-sm font-bold text-gray-700">{totalTime}m</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Serves</p>
              <p className="text-sm font-bold text-gray-700">{recipe.servings}</p>
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Difficulty:</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              recipe.difficulty === "Easy" ? "text-green-600 bg-green-50" :
              recipe.difficulty === "Medium" ? "text-yellow-600 bg-yellow-50" :
              "text-red-600 bg-red-50"
            }`}>
              {recipe.difficulty}
            </span>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-pantry-500 rounded-full" />
              Ingredients
            </h3>
            <div className="space-y-1.5">
              {recipe.availableIngredients.map((ing, idx) => (
                <div
                  key={`avail-${idx}`}
                  className="flex items-center gap-2 text-sm bg-green-50/50 rounded-lg px-3 py-2"
                >
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700 font-medium flex-1">{ing.name}</span>
                  <span className="text-gray-500 text-xs">{ing.quantity}</span>
                </div>
              ))}
              {recipe.missingIngredients.map((name, idx) => (
                <div
                  key={`miss-${idx}`}
                  className="flex items-center gap-2 text-sm bg-orange-50/50 rounded-lg px-3 py-2"
                >
                  <span className="text-orange-500 font-bold">⚠</span>
                  <span className="text-gray-700 font-medium flex-1">{name}</span>
                  <span className="text-orange-400 text-xs">missing</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-pantry-500 rounded-full" />
              Instructions
            </h3>
            <ol className="space-y-2.5">
              {recipe.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-pantry-100 text-pantry-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Chef Tips */}
          {recipe.tips.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-pantry-500 rounded-full" />
                Chef Tips
              </h3>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                {recipe.tips.map((tip, idx) => (
                  <p key={idx} className="text-sm text-amber-800 leading-relaxed flex gap-2">
                    <span className="text-amber-500">•</span>
                    <span>{tip}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Ask AI about this recipe */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
              <span className="w-1 h-4 bg-pantry-500 rounded-full" />
              Ask about this recipe
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Ask a cooking question, or ask to adapt the recipe to what you have.
            </p>

            {/* Conversation thread */}
            {messages.length > 0 && (
              <div className="space-y-2.5 mb-3">
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <div key={msg.id} className="flex justify-end">
                      <p className="max-w-[85%] bg-pantry-600 text-white text-sm rounded-2xl rounded-br-sm px-3.5 py-2 leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex justify-start">
                      <div
                        className={`max-w-[85%] text-sm rounded-2xl rounded-bl-sm px-3.5 py-2 leading-relaxed whitespace-pre-wrap break-words ${
                          msg.status === "rejected"
                            ? "bg-amber-50 text-amber-800 border border-amber-100"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {msg.status === "updated" && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-pantry-700 bg-pantry-100 px-2 py-0.5 rounded-full mb-1.5">
                            ✓ Recipe updated
                          </span>
                        )}
                        {msg.status === "proposed" && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-pantry-700 bg-pantry-100 px-2 py-0.5 rounded-full mb-1.5">
                            Proposed recipe change
                          </span>
                        )}
                        <p>{msg.content}</p>
                        {msg.status === "proposed" && msg.proposedRecipe && (
                          <div className="flex items-center gap-2 mt-2.5">
                            <button
                              type="button"
                              onClick={() => handleProposal(msg.id, true)}
                              className="text-xs font-semibold text-white bg-pantry-600 hover:bg-pantry-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Yes, update
                            </button>
                            <button
                              type="button"
                              onClick={() => handleProposal(msg.id, false)}
                              className="text-xs font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
                {asking && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={threadEndRef} />
              </div>
            )}

            {/* Suggested prompts */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {SUGGESTED_QUESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={asking}
                    onClick={() => submitQuestion(suggestion)}
                    className="text-[11px] font-medium text-gray-600 bg-gray-50 hover:bg-pantry-50 hover:text-pantry-700 border border-gray-200 px-2.5 py-1.5 rounded-full transition-colors disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {askError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">
                {askError}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitQuestion(question);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={MAX_QUESTION_LENGTH}
                disabled={asking}
                placeholder="e.g. Can I use butter instead?"
                aria-label="Ask a question about this recipe"
                className="flex-1 min-w-0 text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pantry-500 focus:border-transparent disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={asking || !question.trim()}
                className="flex-shrink-0 text-sm font-semibold text-white bg-pantry-600 hover:bg-pantry-700 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {asking ? "..." : "Ask"}
              </button>
            </form>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
