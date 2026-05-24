"use client";

import { Archive, ChefHat, ShoppingCart, Users } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { cn } from "@/lib/utils";
import type { NavTab } from "@/lib/types";

const TABS: {
  id: NavTab;
  label: string;
  icon: typeof Users;
}[] = [
  { id: "profiles", label: "Profiles", icon: Users },
  { id: "planner", label: "Planner", icon: ChefHat },
  { id: "shopping", label: "Shop", icon: ShoppingCart },
  { id: "archive", label: "Archive", icon: Archive },
];

export function BottomNav() {
  const { navTab, setNavTab } = useMealPlanner();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800/50 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg justify-around py-3">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = navTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setNavTab(id)}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all active:scale-95",
                active
                  ? "text-emerald drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-medium uppercase tracking-widest">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
