"use client";

import { useRef } from "react";
import { CheckCircle2, ChefHat } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { formatProfileNames } from "@/lib/formatProfileNames";
import { sumScaledMacrosForProfiles } from "@/lib/portionTotals";
import { MacroSummary } from "./MacroSummary";
import { RecipeImage } from "./RecipeImage";

interface ActiveDayCardProps {
  onSwap?: () => void;
}

export function ActiveDayCard({ onSwap }: ActiveDayCardProps) {
  const {
    activeDay,
    weeklyPlan,
    getRecipeById,
    selectedPortionProfiles,
    isDayCompleted,
  } = useMealPlanner();

  const touchStartX = useRef(0);
  const recipeId = weeklyPlan[activeDay];
  const recipe = getRecipeById(recipeId ?? null);
  const cooked = isDayCompleted(activeDay);

  if (!recipe || selectedPortionProfiles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
        <ChefHat className="mx-auto mb-2 h-10 w-10 text-slate-300" />
        <p>
          No dinner planned for this day. Generate a new week or pick another day.
        </p>
      </div>
    );
  }

  const macros = sumScaledMacrosForProfiles(recipe, selectedPortionProfiles);
  const namesLabel = formatProfileNames(
    selectedPortionProfiles.map((p) => p.name)
  );

  const handleTouchStart = (x: number) => {
    touchStartX.current = x;
  };

  const handleTouchEnd = (x: number) => {
    if (cooked || !onSwap) return;
    const delta = x - touchStartX.current;
    if (delta < -56) onSwap();
  };

  return (
    <article
      className={`overflow-hidden rounded-2xl border shadow-sm transition-opacity ${
        cooked
          ? "border-slate-200 bg-slate-100 opacity-75"
          : "border-slate-200 bg-white"
      }`}
      onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
    >
      <div className="relative">
        <RecipeImage
          recipe={recipe}
          className={`h-44 w-full ${cooked ? "grayscale" : ""}`}
        />
        {cooked && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Cooked
          </span>
        )}
        {!cooked && onSwap && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            Swipe left to swap
          </span>
        )}
      </div>
      <div className="space-y-3 p-4">
        <h2
          className={`text-xl font-bold leading-tight ${
            cooked ? "text-slate-500" : "text-slate-900"
          }`}
        >
          {recipe.name}
        </h2>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {cooked ? "Completed · " : ""}
          Dinner total · {namesLabel}
        </p>
        <MacroSummary
          calories={macros.calories}
          protein={macros.protein}
          carbs={macros.carbs}
          fats={macros.fats}
        />
      </div>
    </article>
  );
}
