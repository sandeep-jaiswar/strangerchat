import { CHESS_PUZZLES } from "./puzzles.ts";

export type RankTierId =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "grandmaster";

export interface RankTier {
  id: RankTierId;
  label: string;
  minRating: number;
  badgeClass: string;
}

export const RANK_TIERS: readonly RankTier[] = [
  {
    id: "grandmaster",
    label: "Grandmaster",
    minRating: 2050,
    badgeClass: "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  {
    id: "master",
    label: "Master",
    minRating: 1850,
    badgeClass: "border-purple-500/40 bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
  {
    id: "diamond",
    label: "Diamond",
    minRating: 1650,
    badgeClass: "border-sky-500/40 bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    id: "platinum",
    label: "Platinum",
    minRating: 1450,
    badgeClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "gold",
    label: "Gold",
    minRating: 1250,
    badgeClass: "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    id: "silver",
    label: "Silver",
    minRating: 1100,
    badgeClass: "border-slate-400/40 bg-slate-400/15 text-slate-600 dark:text-slate-300",
  },
  {
    id: "bronze",
    label: "Bronze",
    minRating: 0,
    badgeClass: "border-orange-500/40 bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
] as const;

export function getRankTier(rating: number): RankTier {
  for (const tier of RANK_TIERS) {
    if (rating >= tier.minRating) return tier;
  }
  return RANK_TIERS[RANK_TIERS.length - 1]!;
}

/** Returns today's YYYY-MM-DD UTC string (or shifted by `offsetDays`). */
export function getUtcDateKey(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/** Returns ISO week key like "2026-W46" in UTC for weekly Elo leaderboards. */
export function getIsoWeekKey(date = new Date()): string {
  const tmp = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/** Deterministic daily puzzle index for a UTC YYYY-MM-DD key. */
export function getDailyPuzzleIndex(dateKey = getUtcDateKey()): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash % CHESS_PUZZLES.length;
}
