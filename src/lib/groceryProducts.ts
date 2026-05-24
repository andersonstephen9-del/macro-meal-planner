import path from "node:path";
import { readFileSync } from "node:fs";

export interface ColesProduct {
  name: string;
  url: string;
  quantity: number;
  history: { daySinceEpoch: number; price: number }[];
}

const DEFAULT_DATA_PATH = path.join(
  process.cwd(),
  "data",
  "cleanProductInfo.json"
);

export function getGroceryDataPath(): string {
  return process.env.GROCERY_DATA_PATH ?? DEFAULT_DATA_PATH;
}

export function loadColesProducts(): ColesProduct[] {
  const raw = readFileSync(getGroceryDataPath(), "utf8");
  const products = JSON.parse(raw) as ColesProduct[];
  return products.filter((product) => product.url.includes("coles.com.au"));
}

export function currentPrice(product: ColesProduct): number | null {
  return product.history[0]?.price ?? null;
}

export function isOnSpecial(product: ColesProduct): boolean {
  return (
    product.history.length >= 2 &&
    product.history[0].price < product.history[1].price
  );
}

export function specialDiscount(product: ColesProduct): number {
  if (!isOnSpecial(product)) return 0;
  const current = product.history[0].price;
  const previous = product.history[1].price;
  if (previous <= 0) return 0;
  return (previous - current) / previous;
}
