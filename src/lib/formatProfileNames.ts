/** e.g. "Alex & Jordan" or "Alex, Jordan & Sam" */
export function formatProfileNames(names: string[]): string {
  const filtered = names.map((n) => n.trim()).filter(Boolean);
  if (filtered.length === 0) return "";
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} & ${filtered[1]}`;
  return `${filtered.slice(0, -1).join(", ")} & ${filtered[filtered.length - 1]}`;
}
