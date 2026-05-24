# Smart Macro & Budget Meal Planner

Mobile-first Next.js app for hitting per-profile dinner macro targets and minimizing grocery spend through ingredient reuse.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Lucide React

## Getting started

```bash
cd Projects/macro-meal-planner
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). State persists in `localStorage` under `macro-meal-planner-state-v1`.

## Features

- **Planner** — 7-day dinner plan, profile macro scaling, cooking mode, star ratings
- **Shopping list** — consolidated ingredients by supermarket category with checkboxes
- **Profiles** — up to 6 dinner macro profiles, preference ledger (banned ingredients)
- **Generate New Week** — mocked AI planner favoring ingredient overlap and blacklist filtering

## Project structure

```
src/
  app/              # Next.js routes & global styles
  components/       # UI screens & widgets
  context/          # MealPlannerProvider (state + localStorage)
  lib/              # types, scaling, aggregation, mock recipes, generator
```
