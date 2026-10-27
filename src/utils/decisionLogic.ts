import { Criterion, CriterionScore, ProConItem } from '../types/decision';

/**
 * Calculates net score for pros and cons of an option.
 * Weights are 1-5, impact factors: high = 1.3x, medium = 1.0x, low = 0.7x
 */
export function calculateProsConsScore(pros: ProConItem[] = [], cons: ProConItem[] = []): {
  proScore: number;
  conScore: number;
  netScore: number;
} {
  const getMultiplier = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 1.3;
      case 'low': return 0.7;
      default: return 1.0;
    }
  };

  const proScore = pros.reduce((sum, item) => {
    const w = Number(item.weight) || 3;
    return sum + (w * getMultiplier(item.impact));
  }, 0);

  const conScore = cons.reduce((sum, item) => {
    const w = Number(item.weight) || 3;
    return sum + (w * getMultiplier(item.impact));
  }, 0);

  return {
    proScore: Math.round(proScore * 10) / 10,
    conScore: Math.round(conScore * 10) / 10,
    netScore: Math.round((proScore - conScore) * 10) / 10,
  };
}

/**
 * Computes weighted score for all options across criteria matrix.
 * Returns percentage (0-100) and raw weighted score.
 */
export function calculateMatrixScores(
  options: string[],
  criteria: Criterion[],
  scores: Record<string, Record<string, CriterionScore>>
): Record<string, { totalWeightedScore: number; maxPossibleScore: number; percentage: number }> {
  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 1), 0);
  const maxPossible = totalWeight * 10;

  const result: Record<string, { totalWeightedScore: number; maxPossibleScore: number; percentage: number }> = {};

  for (const option of options) {
    const optionScores = scores[option] || {};
    let weightedSum = 0;

    for (const criterion of criteria) {
      const weight = Number(criterion.weight) || 1;
      const criterionScore = optionScores[criterion.id]?.score ?? 5;
      weightedSum += weight * criterionScore;
    }

    const percentage = maxPossible > 0 ? Math.round((weightedSum / maxPossible) * 100) : 50;
    result[option] = {
      totalWeightedScore: Math.round(weightedSum * 10) / 10,
      maxPossibleScore: maxPossible,
      percentage,
    };
  }

  return result;
}

/**
 * Determines ranking and whether there is an actual dead tie or clear winner.
 */
export function determineWinner(
  options: string[],
  matrixResults: Record<string, { percentage: number }>,
  prosConsScores: Record<string, { netScore: number }>
): {
  winner: string;
  isTie: boolean;
  margin: number;
  ranking: Array<{ option: string; combinedScore: number }>;
} {
  if (options.length === 0) {
    return { winner: '', isTie: false, margin: 0, ranking: [] };
  }

  // Combined score: 60% Matrix percentage + 40% Normalized Pros/Cons
  // Pros/cons normalized around 50 (e.g. net score 0 -> 50, +10 -> 70, -10 -> 30)
  const ranking = options.map((opt) => {
    const matrixPct = matrixResults[opt]?.percentage ?? 50;
    const net = prosConsScores[opt]?.netScore ?? 0;
    // Map net score (-20 to +20 typical) to 0-100 range
    const pcPct = Math.max(0, Math.min(100, 50 + (net * 2.5)));
    const combinedScore = Math.round((matrixPct * 0.6) + (pcPct * 0.4));
    return { option: opt, combinedScore };
  });

  ranking.sort((a, b) => b.combinedScore - a.combinedScore);

  const top = ranking[0];
  const second = ranking[1];
  const margin = second ? top.combinedScore - second.combinedScore : top.combinedScore;
  const isTie = second ? margin <= 2 : false;

  return {
    winner: isTie ? 'Tie' : top.option,
    isTie,
    margin,
    ranking,
  };
}

/**
 * Input validator for decision setup
 */
export function validateDecisionInput(
  title: string,
  options: string[]
): { isValid: boolean; error?: string } {
  const cleanTitle = title.trim();
  if (cleanTitle.length < 3) {
    return { isValid: false, error: 'Please enter a decision title or question (at least 3 characters).' };
  }

  const cleanOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
  if (cleanOptions.length < 2) {
    return { isValid: false, error: 'Please provide at least 2 distinct options to compare.' };
  }

  const uniqueOptions = new Set(cleanOptions.map((o) => o.toLowerCase()));
  if (uniqueOptions.size !== cleanOptions.length) {
    return { isValid: false, error: 'All comparison options must be distinct from one another.' };
  }

  return { isValid: true };
}
