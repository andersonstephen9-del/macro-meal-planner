/**
 * Canonical planner UI tokens — do not change without explicit user approval.
 * Reference implementation: src/components/RecipeCard.reference.tsx
 */

export const macroColorClasses = {
  emerald: "text-emerald drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]",
  cyan: "text-cyan drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]",
  violet: "text-violet drop-shadow-[0_0_12px_rgba(167,139,250,0.4)]",
  coral: "text-coral drop-shadow-[0_0_12px_rgba(251,146,60,0.35)]",
} as const;

export const profileColorClasses = {
  emerald: {
    active: "bg-emerald/10 text-emerald",
    inactive: "bg-transparent text-zinc-500 hover:text-zinc-300",
  },
  violet: {
    active: "bg-violet/10 text-violet",
    inactive: "bg-transparent text-zinc-500 hover:text-zinc-300",
  },
} as const;

export type MacroColor = keyof typeof macroColorClasses;
export type ProfileColor = keyof typeof profileColorClasses;
