import { useState, useEffect } from "react";
import { hasApiKey } from "../services/groqService";

const API_KEY_STORAGE_KEY = "spicebox-groq-api-key";

function getMaskedKey(key: string): string {
  if (key.length <= 8) return "•".repeat(key.length);
  return "•".repeat(key.length - 4) + key.slice(-4);
}

export function Settings() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY) || "";
    setHasKey(hasApiKey());
    if (stored) {
      setKey(stored);
    }
  }, []);

  const handleSave = () => {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
      setSaved(true);
      setCleared(false);
      setHasKey(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setKey("");
    setCleared(true);
    setSaved(false);
    setHasKey(false);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Settings</h2>
        <p className="text-sm text-gray-500 mb-6">
          Your Groq API key is stored locally in your browser and is never sent
          to our servers.
        </p>

        <div className="mb-6">
          <label
            htmlFor="groq-api-key"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Groq API Key
          </label>
          <input
            id="groq-api-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pantry-400 focus:border-transparent text-sm"
          />
          {hasKey && (
            <p className="text-xs text-pantry-600 mt-2">
              Current key: {getMaskedKey(localStorage.getItem(API_KEY_STORAGE_KEY) || "")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-pantry-600 text-white text-sm font-medium rounded-xl hover:bg-pantry-700 transition-colors"
          >
            Save API Key
          </button>
          {hasKey && (
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {saved && (
          <p className="text-sm text-pantry-600 mt-4">✓ API key saved.</p>
        )}
        {cleared && (
          <p className="text-sm text-gray-500 mt-4">API key cleared.</p>
        )}

        <div className="mt-8 p-4 bg-pantry-50 rounded-xl text-xs text-pantry-700">
          <p className="font-medium mb-1">Where do I get a key?</p>
          <p>
            Create one at{" "}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              console.groq.com/keys
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
