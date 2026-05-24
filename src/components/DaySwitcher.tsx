"use client";

import { Check } from "lucide-react";
import { DAYS } from "@/lib/constants";
import { useMealPlanner } from "@/context/MealPlannerProvider";

export function DaySwitcher() {
  const { activeDay, setActiveDay, weeklyPlan, isDayCompleted } =
    useMealPlanner();

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
      {DAYS.map(({ key, short }) => {
        const active = activeDay === key;
        const hasMeal = Boolean(weeklyPlan[key]);
        const cooked = hasMeal && isDayCompleted(key);

        return (
          <button
            key={key}
            type="button"
            onClick={() => setActiveDay(key)}
            className={`relative min-w-[44px] shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
              active
                ? cooked
                  ? "bg-slate-500 text-white shadow-md"
                  : "bg-indigo-600 text-white shadow-md"
                : cooked
                  ? "bg-slate-200 text-slate-500 ring-1 ring-slate-300"
                  : hasMeal
                    ? "bg-white text-slate-700 ring-1 ring-slate-200"
                    : "bg-slate-100 text-slate-400"
            }`}
          >
            {cooked && !active && (
              <Check className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 p-0.5 text-white" />
            )}
            {short}
          </button>
        );
      })}
    </div>
  );
}
