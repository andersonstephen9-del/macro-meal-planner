"use client";

import { useMemo } from "react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { formatProfileNames } from "@/lib/formatProfileNames";
import { buildBreakdownHints } from "@/lib/portionTotals";
import { mergeScaledIngredientsForProfiles } from "@/lib/scaleIngredientsMulti";
import { IngredientAmountList } from "./IngredientAmountList";

export function ScaledIngredientsList() {
  const {
    activeDay,
    weeklyPlan,
    getRecipeById,
    selectedPortionProfiles,
  } = useMealPlanner();

  const recipe = getRecipeById(weeklyPlan[activeDay] ?? null);

  const { ingredients, breakdownHints, namesLabel } = useMemo(() => {
    if (!recipe || selectedPortionProfiles.length === 0) {
      return { ingredients: [], breakdownHints: {}, namesLabel: "" };
    }
    const merged = mergeScaledIngredientsForProfiles(
      recipe,
      selectedPortionProfiles
    );
    return {
      ingredients: merged,
      breakdownHints: buildBreakdownHints(
        recipe,
        merged,
        selectedPortionProfiles
      ),
      namesLabel: formatProfileNames(
        selectedPortionProfiles.map((p) => p.name)
      ),
    };
  }, [recipe, selectedPortionProfiles]);

  if (!recipe || selectedPortionProfiles.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Your portion
      </h3>
      <IngredientAmountList
        ingredients={ingredients}
        breakdownHints={breakdownHints}
        subtitle={`Combined dinner for ${namesLabel}. Each line shows per-person amounts where relevant, totaled for what you cook and shop.`}
      />
    </section>
  );
}
