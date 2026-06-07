import type { DecisionFactor, DecisionOptions } from "@/models/Decision";

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getScore(option: DecisionOptions, factors: DecisionFactor[]) {
  return factors.reduce((total, factor) => {
    const rating = option.ratings[factor.id] || 0;
    return total + factor.factorWeight * rating;
  }, 0);
}

export function sortByScore(options: DecisionOptions[]) {
  return [...options].sort((a, b) => b.score - a.score);
}
