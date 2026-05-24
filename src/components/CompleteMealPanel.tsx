"use client";

import { useState } from "react";
import { Archive, CheckCircle2 } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import type { DayKey } from "@/lib/types";
import { StarRating } from "./StarRating";

interface CompleteMealPanelProps {
  dayKey: DayKey;
  recipeId: string;
  requireChecklists?: boolean;
  ingredientsTotal?: number;
  ingredientsChecked?: number;
  stepsTotal?: number;
  stepsChecked?: number;
  onArchived?: () => void;
}

export function CompleteMealPanel({
  dayKey,
  recipeId,
  requireChecklists = false,
  ingredientsTotal = 0,
  ingredientsChecked = 0,
  stepsTotal = 0,
  stepsChecked = 0,
  onArchived,
}: CompleteMealPanelProps) {
  const { finishMeal, isDayCompleted } = useMealPlanner();
  const [rating, setRating] = useState(0);
  const alreadyDone = isDayCompleted(dayKey);

  const checklistsDone =
    !requireChecklists ||
    (ingredientsChecked >= ingredientsTotal &&
      stepsChecked >= stepsTotal &&
      ingredientsTotal > 0 &&
      stepsTotal > 0);

  const canArchive = !alreadyDone && rating > 0 && checklistsDone;

  const handleArchive = () => {
    if (!canArchive) return;
    finishMeal(dayKey, recipeId, rating);
    onArchived?.();
  };

  if (alreadyDone) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800/80 py-3 text-sm font-medium text-zinc-400">
        <CheckCircle2 className="h-5 w-5 text-emerald" />
        Meal cooked and archived
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-zinc-800/50 pt-4">
      <p className="text-center text-sm font-medium text-zinc-400">
        Rate this dinner, then archive it
      </p>
      <div className="flex justify-center">
        <StarRating value={rating} onChange={setRating} />
      </div>
      {requireChecklists && !checklistsDone && (
        <p className="text-center text-xs text-coral">
          Check off all ingredients and steps to archive.
        </p>
      )}
      {rating === 0 && (
        <p className="text-center text-xs text-zinc-500">
          Select a star rating to continue.
        </p>
      )}
      <button
        type="button"
        onClick={handleArchive}
        disabled={!canArchive}
        className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-violet/90 px-4 py-3 font-semibold text-zinc-950 shadow-md shadow-violet/20 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
      >
        <Archive className="h-5 w-5" />
        Archive meal
      </button>
    </div>
  );
}
