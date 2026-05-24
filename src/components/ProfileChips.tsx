"use client";

import { ArrowLeftRight } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { formatProfileNames } from "@/lib/formatProfileNames";

interface ProfileChipsProps {
  onSwap?: () => void;
}

export function ProfileChips({ onSwap }: ProfileChipsProps) {
  const {
    profiles,
    selectedPortionProfileIds,
    togglePortionProfile,
    selectAllPortionProfiles,
  } = useMealPlanner();

  const allSelected = profiles.every((p) =>
    selectedPortionProfileIds.includes(p.id)
  );

  const selectedNames = profiles
    .filter((p) => selectedPortionProfileIds.includes(p.id))
    .map((p) => p.name);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {profiles.map((profile) => {
            const active = selectedPortionProfileIds.includes(profile.id);
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => togglePortionProfile(profile.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {profile.name}
              </button>
            );
          })}
          {profiles.length > 1 && !allSelected && (
            <button
              type="button"
              onClick={selectAllPortionProfiles}
              className="rounded-full px-3 py-2 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-200"
            >
              Select all
            </button>
          )}
        </div>
        {onSwap && (
          <button
            type="button"
            onClick={onSwap}
            className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-indigo-100 px-3 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 active:scale-95"
            aria-label="Swap this meal"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Swap
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500">
        {selectedNames.length === profiles.length
          ? "Showing combined dinner for everyone"
          : `Combined total for ${formatProfileNames(selectedNames)}`}{" "}
        — tap names to add or remove from the total
      </p>
    </div>
  );
}
