"use client";

import { useMealPlanner } from "@/context/MealPlannerProvider";
import { BottomNav } from "./BottomNav";
import { PlannerView } from "./PlannerView";
import { ShoppingListView } from "./ShoppingListView";
import { ProfilesView } from "./ProfilesView";
import { ArchiveView } from "./ArchiveView";

const TITLES = {
  profiles: "Profiles & Goals",
  planner: "Weekly Planner",
  shopping: "Shopping List",
  archive: "Meal Archive",
} as const;

export function AppShell() {
  const { navTab } = useMealPlanner();
  const isPlanner = navTab === "planner";

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-zinc-950 font-sans">
      <header
        className={
          isPlanner
            ? "mb-8 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]"
            : "sticky top-0 z-30 border-b border-zinc-800/50 bg-zinc-950/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm"
        }
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Smart Macro Planner
        </h1>
        <p className="text-sm tracking-wide text-muted-foreground">
          {TITLES[navTab]}
        </p>
      </header>

      <main className={isPlanner ? "px-4 pb-24" : "px-4 py-2 pb-28"}>
        {navTab === "profiles" && <ProfilesView />}
        {navTab === "planner" && <PlannerView />}
        {navTab === "shopping" && <ShoppingListView />}
        {navTab === "archive" && <ArchiveView />}
      </main>

      <BottomNav />
    </div>
  );
}
