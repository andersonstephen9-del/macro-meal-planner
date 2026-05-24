"use client";

import { Archive } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { formatProfileNames } from "@/lib/formatProfileNames";
import { StarRating } from "./StarRating";
import { RecipeImage } from "./RecipeImage";

export function ArchiveView() {
  const { archivedMeals, getRecipeById } = useMealPlanner();

  if (archivedMeals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <Archive className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p className="font-medium text-slate-700">No archived meals yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Finish a dinner in Cooking Mode, rate it, and tap &quot;Archive meal&quot;
          to save it here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {[...archivedMeals]
        .sort(
          (a, b) =>
            new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )
        .map((entry) => {
          const recipe = getRecipeById(entry.recipeId);
          const imageRecipe = recipe
            ? { ...recipe, imageUrl: entry.imageUrl ?? recipe.imageUrl }
            : {
                id: entry.recipeId,
                name: entry.recipeName,
                baseCalories: 0,
                baseProtein: 0,
                baseCarbs: 0,
                baseFats: 0,
                baseIngredients: [],
                instructions: [],
                imageUrl: entry.imageUrl,
              };

          const cookedFor = formatProfileNames(entry.profileNames);

          return (
            <li
              key={entry.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <RecipeImage recipe={imageRecipe} className="h-40 w-full" />
              <div className="space-y-2 p-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {entry.recipeName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {entry.dayLabel}
                    {cookedFor ? ` · ${cookedFor}` : ""} ·{" "}
                    {new Date(entry.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <StarRating value={entry.rating} readonly size="sm" />
              </div>
            </li>
          );
        })}
    </ul>
  );
}
