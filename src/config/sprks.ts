import { PublicKey } from "@solana/web3.js";

// ─── Token ────────────────────────────────────────────────────────────────────

export const SPRKS_MINT = new PublicKey(
  "EPGoVU5wzZFxL9hu16Dhn3wtyz1P1mPMGQ9Y1KzMebv3"
);
export const SPRKS_DECIMALS = 9;
export const SPRKS_DECIMALS_MULTIPLIER = 1_000_000_000;

// ─── Program ─────────────────────────────────────────────────────────────────

export const PROGRAM_ID = new PublicKey(
  "4YQMDNA5DtsLxNMySEYHbdjj6CPvtRseQ5sgTqmHxt6D"
);

// ─── Presale Dates ────────────────────────────────────────────────────────────

export const PRESALE_START = new Date("2026-04-06T00:00:00Z");
export const PRESALE_END = new Date("2026-05-06T00:00:00Z");

// ─── Tiers ────────────────────────────────────────────────────────────────────
// All USD prices are at reference SOL price below.
// lamports_per_sprks is set on-chain at initialize() time.

export const REFERENCE_SOL_PRICE_USD = 135; // update before deploying

export const TIERS = [
  {
    id: 0,
    name: "Founding 50",
    label: "FOUNDING",
    usdPrice: 0.05,
    supplyDisplayed: 500_000, // displayed SPRKS
    walletCapDisplayed: 10_000, // displayed SPRKS max per wallet
    color: "#68ff03", // lime
    description: "Earliest believers. Limited to 50 participants.",
  },
  {
    id: 1,
    name: "Early Access",
    label: "EARLY",
    usdPrice: 0.10,
    supplyDisplayed: 750_000,
    walletCapDisplayed: 5_000,
    color: "#5ebdea", // sky
    description: "Early community members. 2× the Founding price.",
  },
  {
    id: 2,
    name: "Public",
    label: "PUBLIC",
    usdPrice: 0.20,
    supplyDisplayed: 750_000,
    walletCapDisplayed: 2_500,
    color: "#a855f7", // purple
    description: "Open to all. 4× the Founding price.",
  },
] as const;

export const TOTAL_PRESALE_SUPPLY = 2_000_000; // displayed SPRKS
export const SOFT_CAP_USD = 25_000;
export const HARD_CAP_USD = 250_000;

// ─── Raise Targets ────────────────────────────────────────────────────────────

export function solPriceForTier(tierIndex: number): number {
  const tier = TIERS[tierIndex as 0 | 1 | 2];
  return tier.usdPrice / REFERENCE_SOL_PRICE_USD;
}

export function lamportsPerSprks(tierIndex: number): number {
  return Math.floor(solPriceForTier(tierIndex) * 1_000_000_000);
}

// ─── Brand ────────────────────────────────────────────────────────────────────

export const BRAND = {
  navy: "#0f183e",
  sky: "#5ebdea",
  lime: "#68ff03",
  name: "Sparks",
  symbol: "SPRKS",
  tagline: "The professional network that pays you to show up.",
  subTagline: "No bots. Real people. Real value.",
  website: "https://joinsparks.app",
  twitter: "https://twitter.com/joinSparksApp",
  discord: "",
  appStore: "",
};
