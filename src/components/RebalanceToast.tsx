"use client";

import { useMealPlanner } from "@/context/MealPlannerProvider";

export function RebalanceToast() {
  const { lastRebalanceMessage } = useMealPlanner();
  if (!lastRebalanceMessage) return null;

  return (
    <div
      className="mb-4 rounded-xl border border-emerald/30 bg-emerald/10 px-3 py-2.5 text-center text-sm font-medium text-emerald shadow-lg shadow-emerald/10"
      role="status"
    >
      {lastRebalanceMessage}
    </div>
  );
}
