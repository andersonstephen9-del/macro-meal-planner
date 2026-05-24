"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";

export function GenerateWeekButton() {
  const { runGenerateWeeklyPlan, isGenerating } = useMealPlanner();

  return (
    <button
      type="button"
      onClick={runGenerateWeeklyPlan}
      disabled={isGenerating}
      className="flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition active:scale-[0.98] disabled:opacity-70"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Generating week…
        </>
      ) : (
        <>
          <Sparkles className="h-5 w-5" />
          Generate New Week
        </>
      )}
    </button>
  );
}
