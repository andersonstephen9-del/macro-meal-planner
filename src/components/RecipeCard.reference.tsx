/**
 * CANONICAL PLANNER UI SPEC — DO NOT EDIT WITHOUT EXPLICIT USER APPROVAL.
 *
 * This file is the frozen design reference for layout, colors, spacing, and
 * component structure. The live planner uses PlannerView.tsx wired to app data;
 * keep visual parity with this file when changing behavior only.
 */

"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  ChefHat,
  Scale,
  Users,
  Archive,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  macroColorClasses,
  profileColorClasses,
} from "@/lib/plannerUiStyles";

interface Ingredient {
  name: string;
  amounts: { person: string; shortName: string; amount: string }[];
  total: string;
  unit: string;
}

interface MacroData {
  label: string;
  value: number;
  unit: string;
  color: "emerald" | "cyan" | "violet" | "coral";
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const macros: MacroData[] = [
  { label: "CALORIES", value: 1550, unit: "", color: "emerald" },
  { label: "PROTEIN", value: 126, unit: "g", color: "cyan" },
  { label: "CARBS", value: 54, unit: "g", color: "violet" },
  { label: "FAT", value: 83, unit: "g", color: "coral" },
];

const profiles = [
  { name: "Stephen", shortName: "S", color: "emerald" as const },
  { name: "Jasmine", shortName: "J", color: "violet" as const },
];

const ingredients: Ingredient[] = [
  {
    name: "Asparagus",
    amounts: [
      { person: "Stephen", shortName: "S", amount: "310g" },
      { person: "Jasmine", shortName: "J", amount: "290g" },
    ],
    total: "600",
    unit: "g",
  },
  {
    name: "Dill",
    amounts: [
      { person: "Stephen", shortName: "S", amount: "8g" },
      { person: "Jasmine", shortName: "J", amount: "7g" },
    ],
    total: "15",
    unit: "g",
  },
  {
    name: "Salmon Fillet",
    amounts: [
      { person: "Stephen", shortName: "S", amount: "200g" },
      { person: "Jasmine", shortName: "J", amount: "180g" },
    ],
    total: "380",
    unit: "g",
  },
  {
    name: "Olive Oil",
    amounts: [
      { person: "Stephen", shortName: "S", amount: "1 tbsp" },
      { person: "Jasmine", shortName: "J", amount: "1 tbsp" },
    ],
    total: "2",
    unit: "tbsp",
  },
];

export function RecipeCardReference() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeProfiles, setActiveProfiles] = useState<string[]>([
    "Stephen",
    "Jasmine",
  ]);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);

  const toggleProfile = (name: string) => {
    setActiveProfiles((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const toggleIngredient = (name: string) => {
    setCheckedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 font-sans">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Smart Macro Planner
        </h1>
        <p className="text-sm tracking-wide text-muted-foreground">
          Weekly Planner
        </p>
      </header>

      <nav className="mb-8" aria-label="Select day">
        <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-zinc-900/80 p-1.5 backdrop-blur-sm">
          {days.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDay(index)}
              className={cn(
                "min-w-[48px] flex-1 rounded-full px-3 py-2.5 text-sm font-medium transition-all",
                "active:scale-95",
                selectedDay === index
                  ? "bg-emerald text-zinc-950 shadow-lg shadow-emerald/25"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </nav>

      <article className="mb-4 overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/60 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="relative h-48">
          <img
            src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80"
            alt="Sous Vide Salmon with Asparagus"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur-md">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Swipe to swap
          </div>
        </div>

        <div className="p-6">
          <h2 className="mb-2 text-xl font-bold tracking-tight text-foreground">
            Sous Vide Salmon with Asparagus
          </h2>
          <div className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <ChefHat className="h-3.5 w-3.5" />
            Dinner Total · {activeProfiles.join(" & ")}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {macros.map((macro) => (
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

      <section className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-zinc-900/80 p-1 backdrop-blur-sm">
            {profiles.map((profile) => {
              const isActive = activeProfiles.includes(profile.name);
              const colors = profileColorClasses[profile.color];
              return (
                <button
                  key={profile.name}
                  onClick={() => toggleProfile(profile.name)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                    "active:scale-95",
                    isActive ? colors.active : colors.inactive
                  )}
                >
                  <Users className="h-4 w-4" />
                  {profile.name}
                </button>
              );
            })}
          </div>

          <button className="ml-auto flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-400 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-zinc-200 active:scale-95">
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Showing combined dinner for everyone — tap names to add or remove from
          the total
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-800/50 bg-zinc-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <header className="mb-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Your Portion
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Combined dinner for {activeProfiles.join(" & ")}. Each line shows
            per-person amounts where relevant, totaled for what you cook and
            shop.
          </p>
        </header>

        <div className="mb-6 flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-emerald">
          <Scale className="h-4 w-4" />
          Weigh on a scale (grams)
        </div>

        <ul className="space-y-1">
          {ingredients.map((ingredient) => {
            const isChecked = checkedIngredients.includes(ingredient.name);
            return (
              <li key={ingredient.name}>
                <button
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

                  <div className="min-w-0 flex-1">
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
                        <span
                          className={cn(
                            "ml-0.5 text-sm font-medium",
                            isChecked ? "text-zinc-600" : "text-zinc-400"
                          )}
                        >
                          {ingredient.unit}
                        </span>
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ingredient.amounts.map((a) => (
                        <span
                          key={a.person}
                          className={cn(
                            "inline-flex items-center rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-semibold tracking-wide transition-all duration-200",
                            isChecked ? "text-zinc-600" : "text-zinc-400"
                          )}
                        >
                          {a.shortName}: {a.amount}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <nav className="fixed inset-x-0 bottom-0 border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg justify-around py-3">
          {[
            { icon: Users, label: "Profiles" },
            { icon: ChefHat, label: "Planner", active: true },
            { icon: ShoppingCart, label: "Shop" },
            { icon: Archive, label: "Archive" },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all",
                "active:scale-95",
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
          ))}
        </div>
      </nav>

      <div className="h-24" />
    </div>
  );
}
