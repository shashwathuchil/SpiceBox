interface EmptyStateProps {
  onScan: () => void;
  onAdd: () => void;
}

export function EmptyState({ onScan, onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="w-24 h-24 bg-pantry-50 rounded-full flex items-center justify-center text-5xl mb-5">
        🧺
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        Your pantry is empty
      </h3>
      <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
        Scan a receipt or add ingredients manually to discover delicious recipes
        tailored to what you have.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={onScan}
          className="flex-1 py-3.5 text-sm font-semibold text-white bg-pantry-600 hover:bg-pantry-700 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          📷 Scan Receipt
        </button>
        <button
          onClick={onAdd}
          className="flex-1 py-3.5 text-sm font-semibold text-pantry-700 bg-pantry-50 hover:bg-pantry-100 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          ➕ Add Ingredient
        </button>
      </div>
    </div>
  );
}
