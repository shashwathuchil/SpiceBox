# Smart Pantry

A modern, mobile-first web application that scans grocery receipts, extracts ingredients using AI, stores them in browser Local Storage, and recommends recipes based on what you have.

## Features

- **Receipt Scanning**: Scan barcodes with your camera, then capture or upload a receipt photo
- **AI-Powered OCR**: Uses Groq's multimodal vision model to extract grocery items from receipt images
- **Smart Recipe Recommendations**: Groq AI generates recipes across three categories:
  - 🌎 Intercontinental
  - 🍛 South Indian
  - 🍽️ North Indian
- **Ingredient Management**: Add, edit, remove, and search ingredients manually
- **Local Storage Persistence**: Your pantry survives browser refreshes — no database needed
- **Auto-Refresh Recipes**: Recipe recommendations update automatically (debounced) when ingredients change
- **Polished UI**: Mobile-first responsive design with skeleton loading states, smooth modals, and toast notifications

## Tech Stack

- **React 18** + **TypeScript**
- **Vite 6** for build tooling
- **Tailwind CSS 3** for styling
- **@zxing/browser** for barcode scanning
- **Groq API** for receipt OCR and recipe generation
- **Browser Local Storage** for persistence

## Requirements

- Node.js 18+
- A Groq API key (see below)

## Installation

```bash
npm install
```

## Environment Configuration

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Add your Groq API key:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### How to Get a Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Create an account or sign in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy it into your `.env` file as `VITE_GROQ_API_KEY`

## Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

For mobile testing on your phone, ensure your phone is on the same network and access via your computer's local IP. Vite is configured with `host: true` for this.

## Receipt Scanning Flow

```
Barcode Scan (optional)
       ↓
Barcode detected
       ↓
Receipt image capture/upload
       ↓
Receipt image sent to Groq vision AI
       ↓
Structured grocery items extracted
       ↓
User confirmation/edit screen
       ↓
Saved to Local Storage
       ↓
Groq recipe generation (auto, debounced)
       ↓
Recipe cards displayed
```

### Barcode Limitation

The barcode on a grocery receipt is **not** a product lookup code — it does not contain the list of purchased items. The barcode is typically a store/invoice barcode. Therefore, scanning the barcode is an optional first step. The actual ingredient extraction happens through AI-powered OCR on the receipt image itself.

You can skip barcode scanning entirely and go straight to receipt capture.

## Local Storage Architecture

The app uses a single localStorage key for ingredients:

- **`smart-pantry-ingredients`** — Array of `Ingredient` objects

Optionally cached:

- **`smart-pantry-recipes`** — Last generated recipes
- **`smart-pantry-recipes-timestamp`** — When recipes were last generated

The Groq API key is **never** stored in Local Storage. It is read from the Vite environment variable at build time.

## Groq AI Architecture

All Groq API calls are isolated behind `src/services/groqService.ts` with two methods:

- `extractReceiptImage(imageBase64, mimeType)` — Sends receipt image to Groq vision model
- `generateRecipesRaw(ingredients)` — Sends ingredient list to Groq text model

A validation layer in `src/utils/validateAIResponse.ts` safely parses and validates all AI responses, including stripping markdown code fences and normalizing data types.

### Models Used

- **Vision (receipt OCR)**: `meta-llama/llama-4-scout-17b-16e-instruct`
- **Text (recipe generation)**: `llama-3.3-70b-versatile`

## ⚠️ Security Warning: Browser-Exposed API Key

This application uses Vite's `VITE_GROQ_API_KEY` environment variable, which is **bundled into the browser JavaScript** at build time. This means:

- **Anyone who can access the deployed application can extract the API key** from the browser's dev tools or network requests.
- This is acceptable for **local/personal use** only.
- **Do not deploy this publicly** without moving the Groq API calls behind a backend.

## Moving Groq Calls to a Backend

The service architecture is designed to make this easy. To move Groq calls to a backend:

1. Create a backend API (e.g., Express, Fastify, Next.js API routes) with two endpoints:
   - `POST /api/extract-receipt` — Accepts image, calls Groq, returns items
   - `POST /api/generate-recipes` — Accepts ingredients, calls Groq, returns recipes

2. Store the Groq API key as a **server-side environment variable** (not exposed to the client).

3. Update `src/services/groqService.ts` to call your backend endpoints instead of Groq directly:

```typescript
// Before (direct Groq call)
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { ... });

// After (backend proxy)
const response = await fetch("/api/extract-receipt", { ... });
```

No other code changes are needed — the UI components, hooks, and validation layer remain the same.

## Project Structure

```
src/
├── components/
│   ├── BarcodeScanner.tsx       # Camera barcode scanning with @zxing/browser
│   ├── ReceiptCapture.tsx       # Camera photo capture / file upload
│   ├── ReceiptConfirmation.tsx  # Edit/confirm extracted items before saving
│   ├── IngredientList.tsx       # Searchable ingredient list with filter
│   ├── IngredientForm.tsx       # Add/edit ingredient modal form
│   ├── IngredientCard.tsx       # Single ingredient display with edit/remove
│   ├── RecipeGrid.tsx           # 2-column recipe grid grouped by category
│   ├── RecipeCard.tsx           # Individual recipe card
│   ├── RecipeModal.tsx          # Full recipe detail modal
│   ├── LoadingState.tsx         # Skeleton loading cards
│   └── EmptyState.tsx           # Empty pantry state
│
├── services/
│   ├── groqService.ts           # All Groq API calls (easily swappable to backend)
│   ├── receiptService.ts        # Receipt image → validated items
│   ├── recipeService.ts         # Ingredients → validated recipes
│   └── storageService.ts        # Local Storage CRUD
│
├── types/
│   ├── ingredient.ts            # Ingredient interface
│   ├── recipe.ts                # Recipe + RecipeResponse types
│   └── receipt.ts               # ReceiptItem + ReceiptExtractionResult
│
├── hooks/
│   ├── useIngredients.ts        # Ingredient state + Local Storage sync
│   └── useRecipes.ts            # Debounced auto recipe generation
│
├── utils/
│   ├── validateAIResponse.ts    # JSON parsing, validation, normalization
│   └── normalizeIngredient.ts   # Name/unit normalization, ID generation
│
├── App.tsx                      # Main application
├── main.tsx                     # React entry point
├── index.css                    # Tailwind + global styles
└── vite-env.d.ts                # Vite env type declarations
```

## License

Personal use.
