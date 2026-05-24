"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { mergeScaledIngredientsForProfiles } from "@/lib/scaleIngredientsMulti";
import { RecipeImage } from "./RecipeImage";
import { CompleteMealPanel } from "./CompleteMealPanel";
import { IngredientAmountList } from "./IngredientAmountList";

interface CookingModeProps {
  onClose: () => void;
}

export function CookingMode({ onClose }: CookingModeProps) {
  const { activeDay, weeklyPlan, getRecipeById, profiles } = useMealPlanner();

  const recipe = getRecipeById(weeklyPlan[activeDay] ?? null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set()
  );
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  if (!recipe || profiles.length === 0) return null;

  const householdIngredients = mergeScaledIngredientsForProfiles(
    recipe,
    profiles
  );

  const toggleIngredient = (key: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-xs font-medium uppercase text-indigo-600">
            Cooking mode
          </p>
          <h2 className="text-lg font-bold text-slate-900">{recipe.name}</h2>
          <p className="text-xs text-slate-500">
            Household totals for {profiles.length}{" "}
            {profiles.length === 1 ? "profile" : "profiles"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600"
          aria-label="Close cooking mode"
        >
          <X className="h-6 w-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <RecipeImage recipe={recipe} className="mb-4 h-36 w-full rounded-xl" />

        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Ingredients checklist (household)
          </h3>
          <IngredientAmountList
            ingredients={householdIngredients}
            subtitle="Total grams for everyone at the table. Cook as one batch, then divide protein and veg evenly across plates."
            interactive
            checkedKeys={checkedIngredients}
            onToggle={(key) => toggleIngredient(key)}
          />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase text-slate-500">
            Steps
          </h3>
          <ol className="space-y-3">
            {recipe.instructions.map((step, index) => {
              const done = checkedSteps.has(index);
              return (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => toggleStep(index)}
                    className={`flex w-full gap-3 rounded-xl border px-4 py-3 text-left ${
                      done
                        ? "border-emerald-200 bg-emerald-50 opacity-70"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        done
                          ? "bg-emerald-500 text-white"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <span
                      className={`text-sm leading-relaxed ${done ? "line-through text-slate-500" : "text-slate-800"}`}
                    >
                      {step}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <footer className="border-t border-slate-200 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <CompleteMealPanel
          dayKey={activeDay}
          recipeId={recipe.id}
          requireChecklists
          ingredientsTotal={householdIngredients.length}
          ingredientsChecked={checkedIngredients.size}
          stepsTotal={recipe.instructions.length}
          stepsChecked={checkedSteps.size}
          onArchived={onClose}
        />
      </footer>
    </div>
  );
}
