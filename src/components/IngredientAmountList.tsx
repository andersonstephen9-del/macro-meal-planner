"use client";

import { Check, Scale, Sparkles } from "lucide-react";
import type { ScaledIngredient } from "@/lib/types";
import { toIngredientLines } from "@/lib/ingredientDisplay";

interface IngredientAmountListProps {
  ingredients: ScaledIngredient[];
  subtitle?: string;
  showScaleFactor?: number;
  breakdownHints?: Record<string, string>;
  interactive?: boolean;
  checkedKeys?: Set<string>;
  onToggle?: (key: string) => void;
}

export function IngredientAmountList({
  ingredients,
  subtitle,
  showScaleFactor,
  breakdownHints,
  interactive = false,
  checkedKeys,
  onToggle,
}: IngredientAmountListProps) {
  const { weigh, season } = toIngredientLines(ingredients);

  const withBreakdown = (
    lines: { name: string; primary: string; hint?: string }[]
  ) =>
    lines.map((line) => ({
      ...line,
      hint: breakdownHints?.[line.name]
        ? breakdownHints[line.name]
        : line.hint,
    }));

  return (
    <div className="space-y-4">
      {subtitle && (
        <p className="text-xs leading-relaxed text-slate-500">{subtitle}</p>
      )}

      {weigh.length > 0 && (
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            <Scale className="h-3.5 w-3.5" />
            Weigh on a scale (grams)
          </div>
          <ul className="space-y-2">
            {withBreakdown(weigh).map((line) => (
              <IngredientRow
                key={line.name}
                line={line}
                interactive={interactive}
                checked={checkedKeys?.has(line.name)}
                onToggle={() => onToggle?.(line.name)}
              />
            ))}
          </ul>
        </section>
      )}

      {season.length > 0 && (
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            <Sparkles className="h-3.5 w-3.5" />
            Season &amp; sauce
          </div>
          <ul className="space-y-2">
            {withBreakdown(season).map((line) => (
              <IngredientRow
                key={line.name}
                line={line}
                interactive={interactive}
                checked={checkedKeys?.has(line.name)}
                onToggle={() => onToggle?.(line.name)}
              />
            ))}
          </ul>
        </section>
      )}

      {showScaleFactor != null && (
        <p className="text-xs text-slate-400">
          Calorie scale: {showScaleFactor.toFixed(2)}× vs recipe base
        </p>
      )}
    </div>
  );
}

function IngredientRow({
  line,
  interactive,
  checked,
  onToggle,
}: {
  line: { name: string; primary: string; hint?: string };
  interactive: boolean;
  checked?: boolean;
  onToggle?: () => void;
}) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <span
          className={`block font-medium ${checked ? "line-through text-slate-500" : "text-slate-800"}`}
        >
          {line.name}
        </span>
        {line.hint && (
          <span className="mt-0.5 block text-xs leading-snug text-indigo-600/90">
            {line.hint}
          </span>
        )}
      </div>
      <span
        className={`shrink-0 font-bold tabular-nums ${checked ? "text-slate-400" : "text-emerald-700"}`}
      >
        {line.primary}
      </span>
    </>
  );

  if (interactive && onToggle) {
    return (
      <li>
        <button
          type="button"
          onClick={onToggle}
          className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left ${
            checked
              ? "border-emerald-200 bg-emerald-50/80 opacity-70"
              : "border-slate-200 bg-white"
          }`}
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
              checked
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-slate-300"
            }`}
          >
            {checked && <Check className="h-4 w-4" />}
          </span>
          {content}
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-3 border-b border-slate-50 py-2 last:border-0">
      {content}
    </li>
  );
}
