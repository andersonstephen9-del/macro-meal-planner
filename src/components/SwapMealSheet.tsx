"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Loader2, X } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { getSwapAlternatives } from "@/lib/swapMeal";
import { MOCK_RECIPES } from "@/lib/mockRecipes";
import { RecipeImage } from "./RecipeImage";
import type { DayKey } from "@/lib/types";

interface SwapMealSheetProps {
  dayKey: DayKey;
  onClose: () => void;
}

export function SwapMealSheet({ dayKey, onClose }: SwapMealSheetProps) {
  const {
    weeklyPlan,
    recipeVault,
    preferenceLedger,
    selectedPortionProfiles,
    getRecipeById,
    swapMeal,
    isSwapping,
  } = useMealPlanner();

  const [specialScores, setSpecialScores] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    let cancelled = false;
    const recipePool = [
      ...MOCK_RECIPES,
      ...recipeVault.filter(
        (recipe) => !MOCK_RECIPES.some((mock) => mock.id === recipe.id)
      ),
    ];

    fetch("/api/grocery-specials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipes: recipePool }),
    })
      .then(async (response) => {
        if (!response.ok) return {};
        return response.json() as Promise<{ specials?: Record<string, number> }>;
      })
      .then((payload) => {
        if (!cancelled) {
          setSpecialScores(payload.specials ?? {});
        }
      })
      .catch(() => {
        if (!cancelled) setSpecialScores({});
      });

    return () => {
      cancelled = true;
    };
  }, [recipeVault]);

  const currentId = weeklyPlan[dayKey];
  const current = getRecipeById(currentId ?? null);

  const alternatives = useMemo(
    () =>
      getSwapAlternatives(
        dayKey,
        currentId,
        weeklyPlan,
        recipeVault,
        preferenceLedger,
        selectedPortionProfiles,
        specialScores
      ),
    [
      dayKey,
      currentId,
      weeklyPlan,
      recipeVault,
      preferenceLedger,
      selectedPortionProfiles,
      specialScores,
    ]
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative max-h-[85vh] w-full overflow-hidden rounded-t-2xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase text-indigo-600">
              Swap meal
            </p>
            <h2 className="text-lg font-bold text-slate-900">
              Pick a replacement
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {current && (
          <p className="border-b border-slate-50 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Replacing: <span className="font-semibold">{current.name}</span>
          </p>
        )}

        <ul className="max-h-[60vh] overflow-y-auto px-2 py-2">
          {alternatives.length === 0 ? (
            <li className="p-6 text-center text-sm text-slate-500">
              No swap options match your preferences. Import a recipe or adjust
              banned ingredients.
            </li>
          ) : (
            alternatives.map((recipe) => (
              <li key={recipe.id} className="p-1">
                <button
                  type="button"
                  disabled={isSwapping}
                  onClick={() => {
                    swapMeal(dayKey, recipe.id);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 active:scale-[0.99] disabled:opacity-60"
                >
                  <RecipeImage
                    recipe={recipe}
                    className="h-16 w-16 shrink-0 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{recipe.name}</p>
                    <p className="text-xs text-slate-500">
                      {recipe.baseCalories} cal · P {recipe.baseProtein}g · shares
                      ingredients with your week
                    </p>
                  </div>
                  {isSwapping ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-indigo-600" />
                  ) : (
                    <ArrowLeftRight className="h-5 w-5 shrink-0 text-indigo-600" />
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
