import type { ReactNode } from "react";

type View = "home" | "saved";

interface SidebarProps {
  active: View;
  onChange: (view: View) => void;
  savedCount: number;
}

interface NavItem {
  id: View;
  label: string;
  icon: string;
  badge?: number;
}

const ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "saved", label: "Saved Recipes", icon: "❤️" },
];

export function Sidebar({ active, onChange, savedCount }: SidebarProps) {
  return (
    <>
      {/* Desktop left sidebar */}
      <aside className="hidden sm:flex flex-col fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 z-40 py-6 px-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pantry-400 to-pantry-600 rounded-lg flex items-center justify-center text-white text-sm shadow-sm">
            🧺
          </div>
          <span className="font-bold text-gray-800 text-sm">Smart Pantry</span>
        </div>
        <nav className="space-y-1">
          {ITEMS.map((item) => {
            const isActive = active === item.id;
            const badge = item.id === "saved" ? savedCount : item.badge;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-pantry-50 text-pantry-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {badge ? (
                  <span className="text-xs bg-pantry-100 text-pantry-700 px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 flex items-center justify-around px-2 pb-safe">
        {ITEMS.map((item) => {
          const isActive = active === item.id;
          const badge = item.id === "saved" ? savedCount : item.badge;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-pantry-700" : "text-gray-500"
              }`}
            >
              <span className="relative text-xl">
                {item.icon}
                {badge ? (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] bg-pantry-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
