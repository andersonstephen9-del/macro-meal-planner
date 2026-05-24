interface MacroSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export function MacroSummary({
  calories,
  protein,
  carbs,
  fats,
}: MacroSummaryProps) {
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <MacroCell label="Cal" value={calories} accent="text-emerald-600" />
      <MacroCell label="P" value={`${protein}g`} accent="text-indigo-600" />
      <MacroCell label="C" value={`${carbs}g`} accent="text-amber-600" />
      <MacroCell label="F" value={`${fats}g`} accent="text-rose-600" />
    </div>
  );
}

function MacroCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-1 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`text-lg font-bold tabular-nums ${accent}`}>{value}</p>
    </div>
  );
}
