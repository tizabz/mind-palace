import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface AppState {
  count: number;
  theme: Theme;
  user: { name: string } | null;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setTheme: (theme: Theme) => void;
  setUser: (user: { name: string } | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      count: 0,
      theme: "light",
      user: null,
      increment: () => set((s) => ({ count: s.count + 1 })),
      decrement: () => set((s) => ({ count: s.count - 1 })),
      reset: () => set({ count: 0 }),
      setTheme: (theme) => set({ theme }),
      setUser: (user) => set({ user }),
    }),
    { name: "app-store" },
  ),
);

export interface DecisionFactor {
  factorName: string;
  factorWeight: number;
}
export interface DecisionOptions {
  decisionName: string;
  ratings: Record<number, number>;
  score: number;
  base10Score: number;
}

interface DecisionMatrixStates {
  factors: DecisionFactor[];
  options: DecisionOptions[];
  winnerOption?: DecisionOptions;
  sortedByLargestScore: DecisionOptions[];
  setFactors: (factors: DecisionFactor[]) => void;
  setOptions: (options: DecisionOptions[]) => void;
}

export const useDecisionMatrixStore = create<DecisionMatrixStates>()(
  persist(
    (set) => ({
      factors: [],
      options: [],
      sortedByLargestScore: [],
      setFactors: (factors) => {
        return set({ factors });
      },
      setOptions: (options) => {
        const sortedByLargestScore = [...options].sort(
          (a, b) => b.score - a.score,
        );
        const winnerOption = sortedByLargestScore[0];

        return set({
          options,
          sortedByLargestScore,
          winnerOption,
        });
      },
    }),
    { name: "decision-matrix-store" },
  ),
);

export function getScore(option: DecisionOptions, factors: DecisionFactor[]) {
  return factors.reduce((total, factor, i) => {
    const rating = option.ratings[i] || 0;
    return total + factor.factorWeight * rating;
  }, 0);
}
