import type { ColesProduct } from "./groceryProducts";
import { currentPrice, isOnSpecial } from "./groceryProducts";
import type { SupermarketCategory } from "./types";

const STOP_WORDS = new Set([
  "and",
  "the",
  "with",
  "for",
  "from",
  "coles",
  "fresh",
  "prepacked",
  "pre",
  "packed",
  "pack",
  "each",
  "per",
  "kg",
  "approx",
  "approximate",
  "australian",
  "free",
  "range",
  "perfect",
  "im",
]);

const SYNONYMS: Record<string, string[]> = {
  salmon: ["salmon", "atlantic", "sockeye", "fillet", "fillets"],
  chicken: ["chicken", "breast", "thigh", "tender"],
  beef: ["beef", "steak", "rump", "sirloin", "strip", "strips"],
  turkey: ["turkey", "mince"],
  broccoli: ["broccoli", "florets"],
  pepper: ["capsicum", "pepper", "bell"],
  onion: ["onion", "shallot"],
  rice: ["rice", "brown", "white", "jasmine", "basmati"],
  yogurt: ["yoghurt", "yogurt", "greek"],
  asparagus: ["asparagus"],
  lemon: ["lemon", "lemons"],
  garlic: ["garlic"],
  ginger: ["ginger"],
  tofu: ["tofu"],
  shrimp: ["prawn", "prawns", "shrimp"],
  cod: ["cod", "fish"],
  pork: ["pork"],
  quinoa: ["quinoa"],
  avocado: ["avocado"],
  spinach: ["spinach"],
  tomato: ["tomato", "tomatoes"],
  mushroom: ["mushroom", "mushrooms"],
  beans: ["beans", "bean", "black", "kidney"],
  lentil: ["lentil", "lentils"],
  olive: ["olive", "oil"],
  soy: ["soy", "sauce"],
  sesame: ["sesame", "oil"],
};

/** Block processed goods when matching raw recipe ingredients. */
const RAW_PROCESSING_EXCLUSIONS = [
  "soft drink",
  "soda",
  "juice bottle",
  "tart",
  "crisps",
  "dishwashing",
];

/** Signals a product is a prepared/compound item, not raw produce. */
const COMPOUND_PRODUCT_WORDS = [
  "pudding",
  "cake",
  "tart",
  "tarts",
  "biscuit",
  "biscuits",
  "roulade",
  "tuna",
  "fish",
  "squid",
  "sardine",
  "salmon",
  "crumbed",
  "saucing",
  "pole",
  "poles",
  "rice",
  "pouch",
  "steamed",
  "stir fry",
  "hommus",
  "hummus",
  "chickpea",
  "cracker",
  "crackers",
  "olives",
  "marinade",
  "seasoning",
  "nugget",
  "multipack",
  "dip",
  "sauce",
  "tea",
  "cheesecake",
  "simmer",
  "marinara",
  "tempters",
  "snack",
  "candy",
  "filled",
  "yoghurt",
  "yogurt",
  "tiramisu",
  "blocks",
  "block",
  "icy",
  "pops",
  "infused",
  "curd",
  "chicken",
  "roast",
  "carved",
  "deli",
  "mix",
  "oil",
];

const NON_PRODUCE_PRODUCT_WORDS = [
  "dressing",
  "dressings",
  "paste",
  "fetta",
  "marinated",
  "ribs",
  "corn",
  "kitchen",
  "myrtle",
  "blended",
  "marinate",
  "herb",
  "herbs",
  "flavour",
  "flavor",
  "seasoning",
  "glaze",
  "syrup",
  "concentrate",
];

const PENALTY_WORDS = [
  "nugget",
  "nuggets",
  "dino",
  "snack",
  "canned",
  "instant",
  "frozen",
  "microwave",
  "baby",
  "pet",
  "cheesecake",
  "biscuit",
  "biscuits",
  "sauce",
  "marinade",
  "simmer",
  "seasoning",
  "spread",
  "curd",
  "tea",
  "pole",
  "poles",
  "block",
  "blocks",
  "drink",
  "drinks",
  "lemonade",
  "cordial",
  "oil",
  "juice",
  "tiramisu",
  "roulade",
  "fillet",
  "fillets",
];

const FRUIT_NAMES = [
  "apple",
  "apples",
  "lemon",
  "lemons",
  "lime",
  "limes",
  "orange",
  "oranges",
  "banana",
  "bananas",
  "avocado",
  "avocados",
  "grapefruit",
  "pear",
  "pears",
  "plum",
  "plums",
  "mango",
  "mangoes",
  "berry",
  "berries",
  "melon",
  "watermelon",
  "rockmelon",
  "pineapple",
  "kiwi",
  "grape",
  "grapes",
];

const VEGETABLE_NAMES = [
  "asparagus",
  "broccoli",
  "capsicum",
  "pepper",
  "onion",
  "onions",
  "zucchini",
  "tomato",
  "tomatoes",
  "kale",
  "potato",
  "potatoes",
  "carrot",
  "carrots",
  "spinach",
  "mushroom",
  "mushrooms",
  "cucumber",
  "lettuce",
  "celery",
  "pumpkin",
  "corn",
  "bean",
  "beans",
  "sprout",
  "sprouts",
  "ginger",
  "garlic",
  "shallot",
  "herb",
  "basil",
  "parsley",
  "coriander",
  "lemongrass",
];

const MEAT_NAMES = [
  "chicken",
  "beef",
  "turkey",
  "salmon",
  "prawn",
  "prawns",
  "shrimp",
  "cod",
  "pork",
  "lamb",
  "fish",
  "mince",
  "steak",
  "tofu",
  "veal",
];

const PIECE_GRAMS: { match: string; gramsPerPiece: number }[] = [
  { match: "bell pepper", gramsPerPiece: 150 },
  { match: "onion", gramsPerPiece: 110 },
  { match: "lemon", gramsPerPiece: 60 },
  { match: "lime", gramsPerPiece: 45 },
  { match: "avocado", gramsPerPiece: 200 },
  { match: "apple", gramsPerPiece: 180 },
  { match: "zucchini", gramsPerPiece: 200 },
];

export type ProductCategory =
  | "Fruit"
  | "Fruit & Vegetables"
  | "Meat & Seafood"
  | "Dairy"
  | "Drinks"
  | "Pantry"
  | "Frozen"
  | "Other";

export interface PriceEstimateRequest {
  id: string;
  name: string;
  totalAmount: number;
  unit: string;
  category?: SupermarketCategory;
}

export interface PriceEstimate {
  productName: string;
  productUrl: string;
  packPrice: number;
  packsNeeded: number;
  estimatedCost: number;
  unitPrice?: number;
  unitsNeeded?: number;
  onSpecial?: boolean;
}

export interface PriceEstimateResult {
  estimates: Record<string, PriceEstimate | null>;
  total: number;
  matchedCount: number;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function expandTokens(tokens: string[]): Set<string> {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const synonyms of Object.values(SYNONYMS)) {
      if (synonyms.includes(token)) {
        for (const synonym of synonyms) {
          expanded.add(synonym);
        }
      }
    }
  }
  return expanded;
}

function containsWord(text: string, word: string): boolean {
  const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
  return pattern.test(text);
}

function containsAnyPhrase(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

function primaryProduceKind(name: string): "fruit" | "vegetable" | null {
  const normalized = normalize(name);
  const tokens = normalized.split(" ");
  for (const token of tokens) {
    if (FRUIT_NAMES.includes(token)) return "fruit";
  }
  for (const token of tokens) {
    if (VEGETABLE_NAMES.includes(token)) return "vegetable";
  }
  return null;
}

function isRawProduceIngredient(name: string, category?: SupermarketCategory): boolean {
  if (category === "Produce") return true;
  const normalized = normalize(name);
  if (containsAnyPhrase(normalized, RAW_PROCESSING_EXCLUSIONS)) return false;
  return primaryProduceKind(name) != null;
}

function isRawMeatIngredient(name: string, category?: SupermarketCategory): boolean {
  if (category === "Meat & Seafood") return true;
  const normalized = normalize(name);
  return MEAT_NAMES.some((word) => containsWord(normalized, word));
}

export function inferProductCategory(product: ColesProduct): ProductCategory {
  const name = normalize(product.name);
  const url = product.url.toLowerCase();

  if (containsAnyPhrase(name, COMPOUND_PRODUCT_WORDS)) {
    return "Other";
  }

  if (
    containsAnyPhrase(name, [
      "soft drink",
      "lemonade",
      "fruit drink",
      "cordial",
      "cola",
      "soda",
      "juice",
      "tea",
      "coffee",
    ]) &&
    !containsWord(name, "coconut")
  ) {
    return "Drinks";
  }

  if (containsAnyPhrase(name, ["frozen", "ice cream", "ice block"])) {
    return "Frozen";
  }

  if (
    containsAnyPhrase(name, [
      "milk",
      "yoghurt",
      "yogurt",
      "cheese",
      "butter",
      "cream",
    ])
  ) {
    return "Dairy";
  }

  if (
    MEAT_NAMES.some((word) => containsWord(name, word)) &&
    !containsAnyPhrase(name, [
      "sauce",
      "stock",
      "seasoning",
      "nugget",
      "crumb",
      "marinade",
    ])
  ) {
    return "Meat & Seafood";
  }

  const produceKind = primaryProduceKind(name);
  if (produceKind === "fruit") {
    if (
      containsAnyPhrase(name, RAW_PROCESSING_EXCLUSIONS) ||
      containsAnyPhrase(name, [
        "juice",
        "drink",
        "tart",
        "cake",
        "biscuit",
        "sauce",
        "oil",
        "curd",
        "spread",
        "tea",
      ])
    ) {
      return "Other";
    }
    return "Fruit";
  }

  if (produceKind === "vegetable") {
    if (
      containsAnyPhrase(name, [
        "stock",
        "soup",
        "oil",
        "frozen",
        "crisps",
        "chips",
        "sauce",
      ])
    ) {
      return "Other";
    }
    return "Fruit & Vegetables";
  }

  if (url.includes("approx") && url.includes("each")) {
    return "Fruit & Vegetables";
  }

  return "Other";
}

function categoryAllowedForRawIngredient(
  productCategory: ProductCategory,
  rawKind: "produce" | "meat"
): boolean {
  if (rawKind === "produce") {
    return productCategory === "Fruit" || productCategory === "Fruit & Vegetables";
  }
  return productCategory === "Meat & Seafood";
}

function isCompoundProduct(productName: string, ingredientName: string): boolean {
  const product = normalize(productName);
  const ingredient = normalize(ingredientName);

  for (const word of COMPOUND_PRODUCT_WORDS) {
    if (product.includes(word) && !ingredient.includes(word)) {
      return true;
    }
  }
  return false;
}

function isPrimaryFreshProduce(
  productName: string,
  ingredientName: string
): boolean {
  const product = normalize(productName);
  const ingredientTokens = expandTokens(tokenize(ingredientName));

  if (ingredientTokens.size === 0) return false;
  if (hasProcessingExclusion(ingredientName, productName)) return false;
  if (isCompoundProduct(productName, ingredientName)) return false;
  if (containsAnyPhrase(product, NON_PRODUCE_PRODUCT_WORDS)) return false;

  let matchedProduceToken = false;
  for (const token of ingredientTokens) {
    if (containsWord(product, token)) {
      matchedProduceToken = true;
      break;
    }
  }
  if (!matchedProduceToken) return false;

  if (
    product.includes("prepacked") ||
    product.includes("loose") ||
    product.includes("whole") ||
    product.includes("truss") ||
    product.includes("cut fruit")
  ) {
    return true;
  }

  const productTokens = tokenize(productName);
  const headTokens = productTokens.filter((token) => FRUIT_NAMES.includes(token) || VEGETABLE_NAMES.includes(token));
  if (headTokens.some((token) => ingredientTokens.has(token))) {
    return productTokens.length <= 5;
  }

  return false;
}

function isPrimaryFreshMeat(productName: string, ingredientName: string): boolean {
  const product = normalize(productName);
  const ingredient = normalize(ingredientName);

  if (isCompoundProduct(productName, ingredientName)) return false;

  return MEAT_NAMES.some(
    (word) => containsWord(product, word) && containsWord(ingredient, word)
  );
}

function hasProcessingExclusion(
  ingredientName: string,
  productName: string
): boolean {
  const normalizedProduct = normalize(productName);
  const normalizedIngredient = normalize(ingredientName);

  for (const phrase of RAW_PROCESSING_EXCLUSIONS) {
    if (
      normalizedProduct.includes(phrase) &&
      !normalizedIngredient.includes(phrase)
    ) {
      return true;
    }
  }
  return false;
}

function ingredientMatchesProduct(
  ingredientTokens: Set<string>,
  ingredientName: string,
  productName: string
): boolean {
  const normalizedIngredient = normalize(ingredientName);
  const normalizedProduct = normalize(productName);
  const productTokens = tokenize(productName);

  for (const token of productTokens) {
    if (ingredientTokens.has(token)) return true;
  }

  for (const token of ingredientTokens) {
    if (containsWord(normalizedProduct, token)) return true;
  }

  if (
    containsWord(normalizedProduct, normalizedIngredient) ||
    containsWord(normalizedIngredient, normalizedProduct)
  ) {
    return true;
  }

  return false;
}

function scoreProduct(
  ingredientName: string,
  productName: string,
  preferSingleUnit: boolean,
  product: ColesProduct
): number {
  const ingredientTokens = expandTokens(tokenize(ingredientName));
  const productTokens = tokenize(productName);
  if (ingredientTokens.size === 0 || productTokens.length === 0) return 0;

  if (!ingredientMatchesProduct(ingredientTokens, ingredientName, productName)) {
    return 0;
  }

  let score = 0;
  for (const token of productTokens) {
    if (ingredientTokens.has(token)) score += 2;
  }

  const normalizedIngredient = normalize(ingredientName);
  const normalizedProduct = normalize(productName);
  for (const token of ingredientTokens) {
    if (containsWord(normalizedProduct, token)) score += 2;
  }

  if (containsWord(normalizedProduct, normalizedIngredient)) {
    score += 4;
  }

  for (const penalty of PENALTY_WORDS) {
    if (
      normalizedProduct.includes(penalty) &&
      !normalizedIngredient.includes(penalty)
    ) {
      if (
        penalty === "frozen" &&
        /salmon|fish|prawn|shrimp|cod|seafood/.test(normalizedIngredient)
      ) {
        continue;
      }
      if (
        (penalty === "fillet" || penalty === "fillets") &&
        /salmon|fish|cod|chicken|beef/.test(normalizedIngredient)
      ) {
        continue;
      }
      if (penalty === "juice" && normalizedIngredient.includes("juice")) {
        continue;
      }
      if (penalty === "oil" && normalizedIngredient.includes("oil")) {
        continue;
      }
      score -= 5;
    }
  }

  if (hasProcessingExclusion(ingredientName, productName)) {
    score -= 20;
  }

  if (preferSingleUnit && isLooseSingleItem(product)) {
    score += 6;
  }

  if (isPrimaryFreshProduce(productName, ingredientName)) {
    score += 4;
  }

  const extraTokens = productTokens.filter((token) => !ingredientTokens.has(token));
  if (extraTokens.length > 3) {
    score -= extraTokens.length;
  }

  return score;
}

function isLooseSingleItem(product: ColesProduct): boolean {
  const url = product.url.toLowerCase();
  const name = normalize(product.name);

  if (url.includes("approx") && url.includes("each")) return true;
  if (url.includes("1-each") && product.quantity <= 1) return true;
  if (product.quantity === 1 && !name.includes("prepacked") && !name.includes("pack")) {
    return true;
  }
  return false;
}

function gramsPerPiece(name: string): number | null {
  const normalized = normalize(name);
  for (const { match, gramsPerPiece: grams } of PIECE_GRAMS) {
    if (normalized.includes(match)) return grams;
  }
  return null;
}

function resolveCountQuantity(item: PriceEstimateRequest): number | null {
  const unit = item.unit.toLowerCase();
  if (unit === "pc" || unit === "each") {
    return Math.max(1, Math.round(item.totalAmount));
  }

  const pieceWeight = gramsPerPiece(item.name);
  if (pieceWeight == null) return null;

  const grams =
    unit === "kg"
      ? item.totalAmount * 1000
      : unit === "g"
        ? item.totalAmount
        : null;
  if (grams == null || grams < pieceWeight * 0.75) return null;

  const count = Math.round(grams / pieceWeight);
  if (count < 1) return null;

  const drift = Math.abs(grams - count * pieceWeight) / grams;
  if (drift <= 0.2) return count;

  return null;
}

function neededKilograms(totalAmount: number, unit: string): number | null {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === "g") return totalAmount / 1000;
  if (normalizedUnit === "kg") return totalAmount;
  if (normalizedUnit === "ml") return totalAmount / 1000;
  if (normalizedUnit === "l") return totalAmount;
  return null;
}

function unitPriceForCount(product: ColesProduct, ingredientName: string): number | null {
  const packPrice = currentPrice(product);
  if (packPrice == null || packPrice <= 0) return null;

  if (isLooseSingleItem(product)) {
    return packPrice;
  }

  const pieceWeight = gramsPerPiece(ingredientName);
  if (pieceWeight != null && product.quantity > 0) {
    const packGrams =
      product.url.toLowerCase().includes("kg") || product.quantity >= 0.2
        ? product.quantity * 1000
        : product.quantity;
    if (packGrams > pieceWeight) {
      const piecesPerPack = packGrams / pieceWeight;
      return packPrice / piecesPerPack;
    }
  }

  if (product.quantity === 1) {
    return packPrice;
  }

  return null;
}

function estimateFields(
  product: ColesProduct,
  estimatedCost: number,
  packPrice: number,
  packsNeeded: number,
  extras?: Pick<PriceEstimate, "unitPrice" | "unitsNeeded">
): PriceEstimate {
  return {
    productName: product.name,
    productUrl: product.url,
    packPrice,
    packsNeeded,
    estimatedCost,
    onSpecial: isOnSpecial(product),
    ...extras,
  };
}

function estimateCountItemCost(
  item: PriceEstimateRequest,
  product: ColesProduct,
  unitsNeeded: number
): PriceEstimate | null {
  const unitPrice = unitPriceForCount(product, item.name);
  if (unitPrice == null) return null;

  const packPrice = currentPrice(product);
  if (packPrice == null) return null;

  return estimateFields(product, unitPrice * unitsNeeded, packPrice, 1, {
    unitPrice,
    unitsNeeded,
  });
}

function estimateWeightItemCost(
  item: PriceEstimateRequest,
  product: ColesProduct
): PriceEstimate | null {
  const packPrice = currentPrice(product);
  if (packPrice == null || product.quantity <= 0) return null;

  const neededKg = neededKilograms(item.totalAmount, item.unit);
  if (neededKg == null) return null;

  const packsNeeded = Math.max(1, Math.ceil(neededKg / product.quantity));
  return estimateFields(product, packsNeeded * packPrice, packPrice, packsNeeded);
}

function estimateItemCost(
  item: PriceEstimateRequest,
  product: ColesProduct
): PriceEstimate | null {
  const countQuantity = resolveCountQuantity(item);
  if (countQuantity != null) {
    const countEstimate = estimateCountItemCost(item, product, countQuantity);
    if (countEstimate) return countEstimate;
  }

  return estimateWeightItemCost(item, product);
}

function rawIngredientKind(
  item: PriceEstimateRequest
): "produce" | "meat" | null {
  if (isRawProduceIngredient(item.name, item.category)) return "produce";
  if (isRawMeatIngredient(item.name, item.category)) return "meat";
  return null;
}

function productPassesFilters(
  item: PriceEstimateRequest,
  product: ColesProduct,
  rawKind: "produce" | "meat" | null
): boolean {
  if (hasProcessingExclusion(item.name, product.name)) {
    return false;
  }

  if (isCompoundProduct(product.name, item.name)) {
    return false;
  }

  if (rawKind === "produce") {
    const productCategory = inferProductCategory(product);
    if (!categoryAllowedForRawIngredient(productCategory, rawKind)) {
      return false;
    }
    if (!isPrimaryFreshProduce(product.name, item.name)) {
      return false;
    }
  }

  if (rawKind === "meat") {
    const productCategory = inferProductCategory(product);
    if (!categoryAllowedForRawIngredient(productCategory, rawKind)) {
      return false;
    }
    if (!isPrimaryFreshMeat(product.name, item.name)) {
      return false;
    }
  }

  return true;
}

export function findBestProductForIngredient(
  name: string,
  products: ColesProduct[],
  category?: SupermarketCategory
): ColesProduct | null {
  const item: PriceEstimateRequest = {
    id: name,
    name,
    totalAmount: 500,
    unit: "g",
    category,
  };
  const rawKind = rawIngredientKind(item);
  const countQuantity = resolveCountQuantity(item);

  const ranked = products
    .filter((product) => productPassesFilters(item, product, rawKind))
    .map((product) => ({
      product,
      score: scoreProduct(
        item.name,
        product.name,
        countQuantity != null,
        product
      ),
    }))
    .filter((entry) => entry.score >= 4)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.product ?? null;
}

export function estimateShoppingPrices(
  items: PriceEstimateRequest[],
  products: ColesProduct[]
): PriceEstimateResult {
  const estimates: Record<string, PriceEstimate | null> = {};
  let total = 0;
  let matchedCount = 0;

  for (const item of items) {
    const rawKind = rawIngredientKind(item);
    const countQuantity = resolveCountQuantity(item);

    const ranked = products
      .filter((product) => productPassesFilters(item, product, rawKind))
      .map((product) => ({
        product,
        score: scoreProduct(
          item.name,
          product.name,
          countQuantity != null,
          product
        ),
      }))
      .filter((entry) => entry.score >= 4)
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    if (!best) {
      estimates[item.id] = null;
      continue;
    }

    const estimate = estimateItemCost(item, best.product);
    estimates[item.id] = estimate;
    if (estimate) {
      total += estimate.estimatedCost;
      matchedCount += 1;
    }
  }

  return { estimates, total, matchedCount };
}
