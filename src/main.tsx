import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const API_KEY_STORAGE_KEY = "spicebox-groq-api-key";

// In dev, copy an .env key into localStorage for convenience.
// This branch is removed in production builds so the secret is never bundled.
if (import.meta.env.DEV && !localStorage.getItem(API_KEY_STORAGE_KEY)) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (key) localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
