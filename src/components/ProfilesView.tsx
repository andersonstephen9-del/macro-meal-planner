"use client";

import { useState } from "react";
import { ChevronRight, Import, Plus, Trash2, User } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { MAX_PROFILES } from "@/lib/constants";
import type { Profile } from "@/lib/types";
import { ProfileEditModal } from "./ProfileEditModal";
import { PreferencesSection } from "./PreferencesSection";
import { GenerateWeekButton } from "./GenerateWeekButton";
import { RecipeImportModal } from "./RecipeImportModal";

export function ProfilesView() {
  const { profiles, updateProfile, addProfile, removeProfile } =
    useMealPlanner();
  const [editing, setEditing] = useState<Profile | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Dinner profiles</h2>
        {profiles.length < MAX_PROFILES && (
          <button
            type="button"
            onClick={addProfile}
            className="flex min-h-[44px] items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {profiles.map((profile) => (
          <li
            key={profile.id}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setEditing(profile)}
              className="flex min-h-[56px] flex-1 items-center gap-3 px-4 py-3 text-left"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <User className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-bold text-slate-900">{profile.name}</p>
                <p className="text-xs text-slate-500">
                  {profile.targetCalories} cal · P {profile.targetProtein}g · C{" "}
                  {profile.targetCarbs}g · F {profile.targetFats}g
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
            {profiles.length > 1 && (
              <button
                type="button"
                onClick={() => removeProfile(profile.id)}
                className="mr-2 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Remove ${profile.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      <PreferencesSection />

      <button
        type="button"
        onClick={() => setImportOpen(true)}
        className="flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-4 py-3 text-base font-semibold text-indigo-700 shadow-sm active:scale-[0.98]"
      >
        <Import className="h-5 w-5" />
        Import recipe
      </button>

      <GenerateWeekButton />

      {importOpen && (
        <RecipeImportModal onClose={() => setImportOpen(false)} />
      )}

      {editing && (
        <ProfileEditModal
          profile={editing}
          onSave={updateProfile}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
