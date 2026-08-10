import { useState } from "react";
import type { ReceiptItem } from "../types/receipt";

interface ReceiptConfirmationProps {
  items: ReceiptItem[];
  onConfirm: (items: ReceiptItem[]) => void;
  onCancel: () => void;
}

export function ReceiptConfirmation({
  items,
  onConfirm,
  onCancel,
}: ReceiptConfirmationProps) {
  const [editedItems, setEditedItems] = useState<ReceiptItem[]>([...items]);

  const removeItem = (index: number) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string) => {
    const updated = [...editedItems];
    if (field === "quantity") {
      updated[index] = {
        ...updated[index],
        quantity: value === "" ? null : parseFloat(value) || null,
      };
    } else if (field === "name") {
      updated[index] = { ...updated[index], name: value };
    } else if (field === "unit") {
      updated[index] = { ...updated[index], unit: value || null };
    }
    setEditedItems(updated);
  };

  const formatQty = (item: ReceiptItem) => {
    if (item.quantity === null) return "—";
    return `${item.quantity} ${item.unit || ""}`.trim();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ✕ Cancel
          </button>
          <h2 className="font-bold text-gray-800 text-base">Review Items</h2>
          <div className="w-16" />
        </div>
        <div className="px-4 pb-3 text-center">
          <p className="text-pantry-600 font-semibold text-sm">
            ✓ We found {editedItems.length} ingredients
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            Review, edit, or remove items before adding to your pantry
          </p>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {editedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              All items removed. Cancel to go back.
            </p>
          </div>
        ) : (
          editedItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3 animate-slide-up"
            >
              <div className="flex-1 min-w-0 grid grid-cols-3 gap-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  className="text-sm font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-pantry-400 focus:outline-none py-1"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  value={item.quantity !== null ? String(item.quantity) : ""}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  placeholder="—"
                  className="text-sm text-gray-600 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-pantry-400 focus:outline-none py-1 text-center"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={item.unit || ""}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    placeholder="unit"
                    className="text-sm text-gray-500 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-pantry-400 focus:outline-none py-1 w-full"
                  />
                  <button
                    onClick={() => removeItem(index)}
                    className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          ✕ Cancel
        </button>
        <button
          onClick={() => onConfirm(editedItems)}
          disabled={editedItems.length === 0}
          className="flex-1 py-3.5 text-sm font-semibold text-white bg-pantry-600 hover:bg-pantry-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          ✓ Add to Pantry
        </button>
      </div>
    </div>
  );
}
