export function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 border-4 border-pantry-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-pantry-600 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            🍳
          </div>
        </div>
        <p className="text-gray-700 font-semibold text-base">
          Finding the best recipes...
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Checking your ingredients
        </p>
      </div>

      {/* Skeleton recipe cards */}
      <div className="space-y-4">
        <div className="h-4 w-32 bg-gray-100 rounded animate-shimmer" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-gray-100 to-gray-200" />
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-gray-100 rounded-full animate-shimmer" />
                  <div className="h-5 w-12 bg-gray-100 rounded-full animate-shimmer" />
                </div>
                <div className="h-4 w-full bg-gray-100 rounded animate-shimmer" />
                <div className="h-3 w-3/4 bg-gray-100 rounded animate-shimmer" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-12 bg-gray-50 rounded-lg animate-shimmer" />
                  <div className="h-12 bg-gray-50 rounded-lg animate-shimmer" />
                  <div className="h-12 bg-gray-50 rounded-lg animate-shimmer" />
                </div>
                <div className="h-8 w-full bg-gray-50 rounded-lg animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
