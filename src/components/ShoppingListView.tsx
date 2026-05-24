"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { aggregateShoppingList } from "@/lib/aggregateShoppingList";
import { CATEGORY_ORDER } from "@/lib/constants";
import type { SupermarketCategory } from "@/lib/types";
import { formatAud, useShoppingPrices } from "@/lib/useShoppingPrices";
import { RebalanceToast } from "./RebalanceToast";

export function ShoppingListView() {
  const {
    weeklyPlan,
    recipeVault,
    profiles,
    checkedShoppingItems,
    toggleShoppingItem,
    clearCompletedShopping,
  } = useMealPlanner();

  const items = useMemo(
    () => aggregateShoppingList(weeklyPlan, recipeVault, profiles),
    [weeklyPlan, recipeVault, profiles]
  );

  const { estimates, total, matchedCount, loading, error } =
    useShoppingPrices(items);

  const grouped = useMemo(() => {
    const map = new Map<SupermarketCategory, typeof items>();
    for (const cat of CATEGORY_ORDER) {
      map.set(cat, []);
    }
    for (const item of items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [items]);

  const completedCount = checkedShoppingItems.length;

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Your shopping list will appear once you have meals in your weekly plan.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <RebalanceToast />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {items.length} items · {completedCount} checked · all profiles
        </p>
        {completedCount > 0 && (
          <button
            type="button"
            onClick={clearCompletedShopping}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear Completed
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-900">
              Coles estimate
            </p>
            <p className="text-xs text-emerald-700">
              {loading
                ? "Matching ingredients to scraped prices…"
                : error
                  ? error
                  : `${matchedCount} of ${items.length} items priced`}
            </p>
          </div>
          {!loading && !error && matchedCount > 0 && (
            <p className="text-lg font-bold tabular-nums text-emerald-900">
              {formatAud(total)}
            </p>
          )}
        </div>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const categoryItems = grouped.get(category) ?? [];
        if (categoryItems.length === 0) return null;

        return (
          <section
            key={category}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <h3 className="border-b border-slate-100 px-4 py-3 text-sm font-bold uppercase tracking-wide text-indigo-600">
              {category}
            </h3>
            <ul>
              {categoryItems.map((item) => {
                const checked = checkedShoppingItems.includes(item.id);
                const estimate = estimates[item.id];
                return (
                  <li
                    key={item.id}
                    className={`flex items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-0 ${
                      checked ? "bg-slate-50 opacity-60" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleShoppingItem(item.id)}
                      className="flex shrink-0 items-center justify-center"
                      aria-label={checked ? "Uncheck item" : "Check item"}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                          checked
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-slate-300"
                        }`}
                      >
                        {checked && (
                          <svg
                            className="h-3.5 w-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`block font-medium ${checked ? "line-through text-slate-400" : "text-slate-800"}`}
                      >
                        {item.name}
                      </span>
                      {item.usedInMeals.length > 0 && (
                        <span
                          className={`mt-0.5 block text-xs leading-snug ${checked ? "text-slate-400" : "text-slate-500"}`}
                        >
                          For: {item.usedInMeals.join(" · ")}
                        </span>
                      )}
                      {estimate && !checked && (
                        <span className="mt-0.5 block text-xs text-emerald-700">
                          <a
                            href={estimate.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-emerald-300 underline-offset-2 hover:text-emerald-900"
                          >
                            {estimate.productName}
                          </a>
                          {estimate.onSpecial && (
                            <span className="ml-1.5 font-semibold text-amber-700">
                              On special
                            </span>
                          )}
                          {estimate.unitsNeeded != null &&
                          estimate.unitPrice != null
                            ? ` · ${estimate.unitsNeeded} × ${formatAud(estimate.unitPrice)}`
                            : estimate.packsNeeded > 1
                              ? ` · ${estimate.packsNeeded} packs`
                              : ""}
                        </span>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`block font-bold tabular-nums ${checked ? "text-slate-400" : "text-emerald-700"}`}
                      >
                        {formatAmount(item.totalAmount)} {item.unit}
                      </span>
                      {estimate && (
                        <span
                          className={`block text-xs tabular-nums ${checked ? "text-slate-400" : "text-emerald-700"}`}
                        >
                          {formatAud(estimate.estimatedCost)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function formatAmount(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(1);
}
