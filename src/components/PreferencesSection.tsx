"use client";

import { useState } from "react";
import { Ban, Plus, X } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";

export function PreferencesSection() {
  const {
    preferenceLedger,
    addBannedIngredient,
    removeBannedIngredient,
    removeLikedFlavorProfile,
  } = useMealPlanner();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    addBannedIngredient(input);
    setInput("");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Ban className="h-5 w-5 text-rose-500" />
        <h3 className="text-base font-bold text-slate-900">Preference Ledger</h3>
      </div>

      <p className="mb-3 text-sm text-slate-600">
        Banned ingredients are excluded when generating a new week.
      </p>

      <div className="mb-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="e.g. cilantro, shrimp"
          className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-3 text-base outline-none ring-indigo-500 focus:ring-2"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-rose-500 text-white"
          aria-label="Add banned ingredient"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {preferenceLedger.dislikedIngredients.length === 0 ? (
        <p className="text-sm text-slate-400">No banned ingredients yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {preferenceLedger.dislikedIngredients.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-800"
            >
              {item}
              <button
                type="button"
                onClick={() => removeBannedIngredient(item)}
                className="rounded-full p-0.5 hover:bg-rose-100"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
          Learned flavor profiles
        </p>
        {preferenceLedger.likedFlavorProfiles.length === 0 ? (
          <p className="text-sm text-slate-400">
            Rate meals 4★+ to learn flavor preferences.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {preferenceLedger.likedFlavorProfiles.map((tag) => (
              <li
                key={tag}
                className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeLikedFlavorProfile(tag)}
                  className="rounded-full p-0.5 hover:bg-emerald-100"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
