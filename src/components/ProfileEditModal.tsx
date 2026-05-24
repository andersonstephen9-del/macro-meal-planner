"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Profile } from "@/lib/types";

interface ProfileEditModalProps {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onClose: () => void;
}

export function ProfileEditModal({
  profile,
  onSave,
  onClose,
}: ProfileEditModalProps) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const fields: {
    key: keyof Pick<
      Profile,
      "targetCalories" | "targetProtein" | "targetCarbs" | "targetFats"
    >;
    label: string;
    unit?: string;
  }[] = [
    { key: "targetCalories", label: "Target Calories" },
    { key: "targetProtein", label: "Protein", unit: "g" },
    { key: "targetCarbs", label: "Carbs", unit: "g" },
    { key: "targetFats", label: "Fats", unit: "g" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Edit profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-slate-600">
            Name
          </span>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none ring-indigo-500 focus:ring-2"
          />
        </label>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Dinner targets
        </p>

        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ key, label, unit }) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                {label}
                {unit ? ` (${unit})` : ""}
              </span>
              <input
                type="number"
                min={0}
                value={draft[key]}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [key]: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base font-semibold outline-none ring-indigo-500 focus:ring-2"
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            onSave(draft);
            onClose();
          }}
          className="mt-5 w-full min-h-[48px] rounded-xl bg-indigo-600 py-3 font-semibold text-white"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
