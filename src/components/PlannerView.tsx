"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  ChefHat,
  Scale,
  Users,
} from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { DAYS } from "@/lib/constants";
import { formatProfileNames } from "@/lib/formatProfileNames";
import {
  buildPortionIngredientRows,
  sumScaledMacrosForProfiles,
} from "@/lib/portionTotals";
import {
  macroColorClasses,
  profileColorClasses,
  type ProfileColor,
} from "@/lib/plannerUiStyles";
import { cn } from "@/lib/utils";
import { SwapMealSheet } from "./SwapMealSheet";
import { RebalanceToast } from "./RebalanceToast";
import { RecipeImage } from "./RecipeImage";

function compactBadgeAmount(amount: string): string {
  return amount.replace(/(\d)\s+g\b/i, "$1g");
}

export function PlannerView() {
  const {
    activeDay,
    setActiveDay,
    weeklyPlan,
    getRecipeById,
    isDayCompleted,
    profiles,
    selectedPortionProfileIds,
    togglePortionProfile,
  } = useMealPlanner();

  const [swapOpen, setSwapOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const touchStartX = useRef(0);

  const recipe = getRecipeById(weeklyPlan[activeDay] ?? null);
  const cooked = isDayCompleted(activeDay);
  const canSwap = Boolean(recipe && !cooked);

  const selectedProfiles = useMemo(
    () => profiles.filter((p) => selectedPortionProfileIds.includes(p.id)),
    [profiles, selectedPortionProfileIds]
  );

  const activeProfileNames = selectedProfiles.map((p) => p.name);
  const namesLabel = formatProfileNames(activeProfileNames);

  const macros = useMemo(() => {
    if (!recipe || selectedProfiles.length === 0) return null;
    return sumScaledMacrosForProfiles(recipe, selectedProfiles);
  }, [recipe, selectedProfiles]);

  const ingredientRows = useMemo(() => {
    if (!recipe || selectedProfiles.length === 0) return [];
    return buildPortionIngredientRows(recipe, selectedProfiles);
  }, [recipe, selectedProfiles]);

  const macroTiles = macros
    ? [
        {
          label: "CALORIES",
          value: macros.calories,
          unit: "",
          color: "emerald" as const,
        },
        {
          label: "PROTEIN",
          value: macros.protein,
          unit: "g",
          color: "cyan" as const,
        },
        {
          label: "CARBS",
          value: macros.carbs,
          unit: "g",
          color: "violet" as const,
        },
        { label: "FAT", value: macros.fats, unit: "g", color: "coral" as const },
      ]
    : [];

  const toggleIngredient = (name: string) => {
    setCheckedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleTouchStart = (x: number) => {
    touchStartX.current = x;
  };

  const handleTouchEnd = (x: number) => {
    if (!canSwap) return;
    if (x - touchStartX.current < -56) setSwapOpen(true);
  };

  if (!recipe || selectedProfiles.length === 0) {
    return (
      <>
        <RebalanceToast />
        <nav className="mb-8" aria-label="Select day">
          <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-zinc-900/80 p-1.5 backdrop-blur-sm">
            {DAYS.map(({ key, short }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveDay(key)}
                className={cn(
                  "min-w-[48px] flex-1 rounded-full px-3 py-2.5 text-sm font-medium transition-all active:scale-95",
                  activeDay === key
                    ? "bg-emerald text-zinc-950 shadow-lg shadow-emerald/25"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {short}
              </button>
            ))}
          </div>
        </nav>
        <div className="rounded-2xl border border-dashed border-zinc-800/50 bg-zinc-900/40 p-8 text-center text-zinc-400">
          <ChefHat className="mx-auto mb-2 h-10 w-10 text-zinc-600" />
          <p>No dinner planned. Generate a new week from Profiles.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <RebalanceToast />

      {/* Day Selector — v0 capsule track */}
      <nav className="mb-8" aria-label="Select day">
        <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-zinc-900/80 p-1.5 backdrop-blur-sm">
          {DAYS.map(({ key, short }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveDay(key)}
              className={cn(
                "min-w-[48px] flex-1 rounded-full px-3 py-2.5 text-sm font-medium transition-all active:scale-95",
                activeDay === key
                  ? "bg-emerald text-zinc-950 shadow-lg shadow-emerald/25"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {short}
            </button>
          ))}
        </div>
      </nav>

      {/* Bento Card 1: Recipe + Macros */}
      <article
        className={cn(
          "mb-4 overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/60 shadow-2xl shadow-black/40 backdrop-blur-xl",
          cooked && "opacity-80"
        )}
        onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
      >
        <div className="relative h-48">
          <RecipeImage
            recipe={recipe}
            className={cn("h-full w-full", cooked && "grayscale")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

          {canSwap && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur-md">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Swipe to swap
            </div>
          )}
        </div>

        <div className="p-6">
          <h2
            className={cn(
              "mb-2 text-xl font-bold tracking-tight text-foreground",
              cooked && "text-zinc-400"
            )}
          >
            {recipe.name}
          </h2>
          <div className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <ChefHat className="h-3.5 w-3.5" />
            {cooked ? "Completed · " : ""}
            Dinner Total · {namesLabel}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {macroTiles.map((macro) => (
              <div
                key={macro.label}
                className="flex flex-col items-center rounded-xl bg-zinc-800/80 p-4"
              >
                <span
                  className={cn(
                    "text-2xl font-bold tabular-nums",
                    macroColorClasses[macro.color]
                  )}
                >
                  {macro.value}
                  <span className="text-base font-semibold">{macro.unit}</span>
                </span>
                <span className="mt-1 text-[9px] font-medium uppercase tracking-widest text-zinc-500">
                  {macro.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* Profile Toggles — v0 segmented control */}
      <section className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-zinc-900/80 p-1 backdrop-blur-sm">
            {profiles.map((profile, index) => {
              const isActive = selectedPortionProfileIds.includes(profile.id);
              const color: ProfileColor =
                index % 2 === 0 ? "emerald" : "violet";
              const colors = profileColorClasses[color];
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => togglePortionProfile(profile.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all active:scale-95",
                    isActive ? colors.active : colors.inactive
                  )}
                >
                  <Users className="h-4 w-4" />
                  {profile.name}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setSwapOpen(true)}
            disabled={!canSwap}
            className="ml-auto flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-400 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-zinc-200 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Showing combined dinner for everyone — tap names to add or remove from
          the total
        </p>
      </section>

      {/* Bento Card 2: Ingredients Checklist */}
      {!cooked && (
        <section className="rounded-2xl border border-zinc-800/50 bg-zinc-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <header className="mb-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Your Portion
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Combined dinner for {namesLabel}. Each line shows per-person amounts
              where relevant, totaled for what you cook and shop.
            </p>
          </header>

          <div className="mb-6 flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-emerald">
            <Scale className="h-4 w-4" />
            Weigh on a scale (grams)
          </div>

          <ul className="space-y-1">
            {ingredientRows.map((ingredient) => {
              const isChecked = checkedIngredients.includes(ingredient.name);
              return (
                <li key={ingredient.name}>
                  <button
                    type="button"
                    onClick={() => toggleIngredient(ingredient.name)}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all duration-200",
                      "hover:bg-zinc-800/50 active:bg-zinc-800/80"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                        isChecked
                          ? "border-emerald bg-emerald shadow-lg shadow-emerald/30"
                          : "border-zinc-500 bg-transparent"
                      )}
                    >
                      {isChecked && (
                        <Check
                          className="h-3.5 w-3.5 text-zinc-950"
                          strokeWidth={3}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-4">
                        <span
                          className={cn(
                            "font-semibold transition-all duration-200",
                            isChecked
                              ? "text-zinc-500 line-through"
                              : "text-foreground"
                          )}
                        >
                          {ingredient.name}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-lg font-bold tabular-nums transition-all duration-200",
                            isChecked ? "text-zinc-600" : "text-zinc-100"
                          )}
                        >
                          {ingredient.total}
                          {ingredient.unit && (
                            <span
                              className={cn(
                                "ml-0.5 text-sm font-medium",
                                isChecked ? "text-zinc-600" : "text-zinc-400"
                              )}
                            >
                              {ingredient.unit}
                            </span>
                          )}
                        </span>
                      </div>

                      {ingredient.amounts.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {ingredient.amounts.map((a) => (
                            <span
                              key={a.person}
                              className={cn(
                                "inline-flex items-center rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-semibold tracking-wide transition-all duration-200",
                                isChecked ? "text-zinc-600" : "text-zinc-400"
                              )}
                            >
                              {a.shortName}: {compactBadgeAmount(a.amount)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {swapOpen && (
        <SwapMealSheet dayKey={activeDay} onClose={() => setSwapOpen(false)} />
      )}
    </>
  );
}
