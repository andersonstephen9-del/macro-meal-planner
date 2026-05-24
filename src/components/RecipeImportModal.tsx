"use client";

import { useRef, useState } from "react";
import {
  Camera,
  ClipboardPaste,
  Globe,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import type { RecipeImportSource } from "@/lib/parseRecipeImport";
import type { Recipe } from "@/lib/types";

interface RecipeImportModalProps {
  onClose: () => void;
}

const TABS: { id: RecipeImportSource; label: string; icon: typeof Globe }[] = [
  { id: "url", label: "Website", icon: Globe },
  { id: "text", label: "Paste", icon: ClipboardPaste },
  { id: "photo", label: "Photo", icon: Camera },
];

const SAMPLE_TEXT = `Title: Lemon Herb Chicken Bowl

Ingredients:
- 200 g chicken breast
- 150 g brown rice
- 120 g spinach
- 15 g olive oil
- 30 g lemon juice

Instructions:
1. Cook rice until fluffy.
2. Season and grill chicken to 165°F internal.
3. Wilt spinach; drizzle with oil and lemon.`;

export function RecipeImportModal({ onClose }: RecipeImportModalProps) {
  const { importRecipe } = useMealPlanner();
  const [tab, setTab] = useState<RecipeImportSource>("text");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [photoHint, setPhotoHint] = useState("");
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Recipe | null>(null);
  const [parseSummary, setParseSummary] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleParse = async () => {
    setError(null);
    setPreview(null);
    setIsParsing(true);
    try {
      let content = "";
      if (tab === "url") {
        content = url.trim();
        if (!content) throw new Error("Enter a recipe URL.");
      } else if (tab === "text") {
        content = text.trim();
        if (!content) throw new Error("Paste recipe text.");
      } else {
        if (!photoDataUrl) throw new Error("Choose a cookbook photo first.");
        content = photoDataUrl;
      }

      const result = await importRecipe({
        source: tab,
        content,
        photoHint: tab === "photo" ? photoHint : undefined,
        dryRun: true,
      });
      setPreview(result.recipe);
      setParseSummary(result.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not parse recipe.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    setIsParsing(true);
    try {
      await importRecipe({
        source: tab,
        content:
          tab === "url"
            ? url
            : tab === "text"
              ? text
              : photoDataUrl || "",
        photoHint: tab === "photo" ? photoHint : undefined,
        recipeOverride: preview,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase text-indigo-600">
              Import recipe
            </p>
            <h2 className="text-lg font-bold text-slate-900">
              Clip from anywhere
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex gap-1 border-b border-slate-100 px-2 py-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setPreview(null);
                setError(null);
              }}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-xs font-semibold ${
                tab === id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 text-xs text-slate-500">
            Saved recipes join your vault and can be picked when you tap{" "}
            <span className="font-semibold">Generate New Week</span>.
          </p>

          {tab === "url" && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600">
                Recipe URL
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/steak-dinner"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-base outline-none ring-indigo-500 focus:ring-2"
              />
              <p className="mt-1 text-xs text-slate-400">
                Paste a link and OpenAI will extract the recipe from the page.
              </p>
            </label>
          )}

          {tab === "text" && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600">
                Paste recipe
              </span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder={SAMPLE_TEXT}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              />
              <button
                type="button"
                onClick={() => setText(SAMPLE_TEXT)}
                className="mt-2 text-xs font-medium text-indigo-600"
              >
                Load sample recipe
              </button>
            </label>
          )}

          {tab === "photo" && (
            <div className="space-y-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPhotoName(file.name);
                  setPhotoDataUrl(null);
                  setPreview(null);
                  const reader = new FileReader();
                  reader.onload = () => {
                    setPhotoDataUrl(String(reader.result));
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full min-h-[100px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600"
              >
                <Camera className="h-8 w-8" />
                {photoName ? photoName : "Snap or upload cookbook page"}
              </button>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-600">
                  Caption (helps AI)
                </span>
                <input
                  type="text"
                  value={photoHint}
                  onChange={(e) => setPhotoHint(e.target.value)}
                  placeholder="e.g. lemon chicken with rice"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none ring-indigo-500 focus:ring-2"
                />
              </label>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          {preview && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <p className="text-xs font-semibold uppercase text-emerald-700">
                Parsed preview
              </p>
              <p className="mt-1 font-bold text-slate-900">{preview.name}</p>
              <p className="text-xs text-slate-600">{parseSummary}</p>
              <p className="mt-2 text-xs text-slate-500">
                {preview.baseCalories} cal · P {preview.baseProtein}g · C{" "}
                {preview.baseCarbs}g · F {preview.baseFats}g ·{" "}
                {preview.baseIngredients.length} ingredients ·{" "}
                {preview.instructions.length} steps
              </p>
            </div>
          )}
        </div>

        <footer className="space-y-2 border-t border-slate-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {!preview ? (
            <button
              type="button"
              onClick={handleParse}
              disabled={isParsing}
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white disabled:opacity-60"
            >
              {isParsing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI parsing…
                </>
              ) : (
                "Parse with AI"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isParsing}
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white"
            >
              <Plus className="h-5 w-5" />
              Save to recipe vault
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
