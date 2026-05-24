import { MOCK_RECIPES } from "./mockRecipes";
import { STORAGE_KEY } from "./constants";
import { emptyCompletedDays } from "./completedDays";
import type { AppState, ArchivedMeal, Recipe } from "./types";

export function createInitialState(): AppState {
  const profiles = [
    {
      id: "profile-1",
      name: "Stephen",
      targetCalories: 650,
      targetProtein: 55,
      targetCarbs: 45,
      targetFats: 22,
    },
    {
      id: "profile-2",
      name: "Jasmine",
      targetCalories: 520,
      targetProtein: 42,
      targetCarbs: 38,
      targetFats: 16,
    },
  ];

  const weeklyPlan = {
    monday: "recipe-air-fry-chicken",
    tuesday: "recipe-lean-beef-stir-fry",
    wednesday: "recipe-sous-vide-salmon",
    thursday: "recipe-turkey-chili",
    friday: "recipe-shrimp-zoodles",
    saturday: "recipe-cod-sweet-potato",
    sunday: "recipe-pork-tenderloin",
  };

  return {
    profiles,
    weeklyPlan,
    recipeVault: [...MOCK_RECIPES],
    archivedMeals: [],
    completedDays: emptyCompletedDays(),
    preferenceLedger: {
      dislikedIngredients: [],
      likedFlavorProfiles: ["garlic", "high-protein", "stir-fry"],
    },
    selectedPortionProfileIds: profiles.map((p) => p.id),
    activeDay: "monday",
    checkedShoppingItems: [],
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as AppState;
    const initial = createInitialState();
    const mergedProfiles = parsed.profiles ?? initial.profiles;
    const legacyActive = (parsed as AppState & { activeProfileId?: string })
      .activeProfileId;

    return {
      ...initial,
      ...parsed,
      profiles: mergedProfiles,
      selectedPortionProfileIds: migrateSelectedPortionIds(
        parsed,
        mergedProfiles,
        legacyActive
      ),
      archivedMeals: migrateArchivedMeals(parsed.archivedMeals),
      completedDays: {
        ...emptyCompletedDays(),
        ...parsed.completedDays,
      },
      recipeVault: mergeRecipeVault(initial.recipeVault, parsed.recipeVault),
      preferenceLedger: {
        ...initial.preferenceLedger,
        ...parsed.preferenceLedger,
      },
    };
  } catch {
    return createInitialState();
  }
}

function migrateSelectedPortionIds(
  parsed: Partial<AppState> & { activeProfileId?: string },
  profiles: AppState["profiles"],
  legacyActiveId?: string
): string[] {
  if (parsed.selectedPortionProfileIds?.length) {
    const valid = parsed.selectedPortionProfileIds.filter((id) =>
      profiles.some((p) => p.id === id)
    );
    if (valid.length > 0) return valid;
  }
  if (legacyActiveId && profiles.some((p) => p.id === legacyActiveId)) {
    return profiles.map((p) => p.id);
  }
  return profiles.map((p) => p.id);
}

function migrateArchivedMeals(
  saved?: ArchivedMeal[]
): ArchivedMeal[] {
  if (!saved?.length) return [];
  return saved.map((entry) => {
    const legacy = entry as ArchivedMeal & { profileName?: string };
    if (legacy.profileNames?.length) return entry;
    if (legacy.profileName) {
      return { ...entry, profileNames: [legacy.profileName] };
    }
    return { ...entry, profileNames: [] };
  });
}

function mergeRecipeVault(
  defaults: AppState["recipeVault"],
  saved?: AppState["recipeVault"]
): AppState["recipeVault"] {
  if (!saved?.length) return defaults;
  const map = new Map(defaults.map((r) => [r.id, r]));
  for (const r of saved) {
    const base = map.get(r.id);
    if (base) {
      map.set(r.id, {
        ...r,
        baseIngredients: base.baseIngredients,
        baseCalories: base.baseCalories,
        baseProtein: base.baseProtein,
        baseCarbs: base.baseCarbs,
        baseFats: base.baseFats,
      });
    } else {
      map.set(r.id, r);
    }
  }
  return Array.from(map.values());
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
