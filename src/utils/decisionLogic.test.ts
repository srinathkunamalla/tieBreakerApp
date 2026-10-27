import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProsConsScore,
  calculateMatrixScores,
  determineWinner,
  validateDecisionInput,
} from './decisionLogic';
import { Criterion, CriterionScore, ProConItem } from '../types/decision';

test('calculateProsConsScore computes weighted pros and cons with impact multipliers', () => {
  const pros: ProConItem[] = [
    { id: '1', text: 'High salary', weight: 5, category: 'Financial', impact: 'high' }, // 5 * 1.3 = 6.5
    { id: '2', text: 'Good commute', weight: 3, category: 'Life Quality', impact: 'medium' }, // 3 * 1.0 = 3.0
  ];
  const cons: ProConItem[] = [
    { id: '3', text: 'Long hours', weight: 4, category: 'Life Quality', impact: 'medium' }, // 4 * 1.0 = 4.0
    { id: '4', text: 'Less prestige', weight: 2, category: 'Career', impact: 'low' }, // 2 * 0.7 = 1.4
  ];

  const result = calculateProsConsScore(pros, cons);
  assert.equal(result.proScore, 9.5); // 6.5 + 3.0
  assert.equal(result.conScore, 5.4); // 4.0 + 1.4
  assert.equal(result.netScore, 4.1); // 9.5 - 5.4
});

test('calculateProsConsScore handles empty pros and cons gracefully', () => {
  const result = calculateProsConsScore([], []);
  assert.equal(result.proScore, 0);
  assert.equal(result.conScore, 0);
  assert.equal(result.netScore, 0);
});

test('calculateMatrixScores calculates weighted percentage accurately', () => {
  const criteria: Criterion[] = [
    { id: 'comp', name: 'Compensation', weight: 8, description: 'Pay' },
    { id: 'wlb', name: 'Work Life Balance', weight: 6, description: 'Hours' },
  ];
  // Total weight = 14. Max possible = 140.

  const scores: Record<string, Record<string, CriterionScore>> = {
    OptionA: {
      comp: { score: 10, reason: 'Great pay' }, // 8 * 10 = 80
      wlb: { score: 5, reason: 'Average' },    // 6 * 5 = 30 -> 110/140 = 78.57% -> 79%
    },
    OptionB: {
      comp: { score: 6, reason: 'Okay pay' },  // 8 * 6 = 48
      wlb: { score: 9, reason: 'Great hours' }, // 6 * 9 = 54 -> 102/140 = 72.85% -> 73%
    },
  };

  const results = calculateMatrixScores(['OptionA', 'OptionB'], criteria, scores);
  assert.equal(results['OptionA'].totalWeightedScore, 110);
  assert.equal(results['OptionA'].maxPossibleScore, 140);
  assert.equal(results['OptionA'].percentage, 79);

  assert.equal(results['OptionB'].totalWeightedScore, 102);
  assert.equal(results['OptionB'].percentage, 73);
});

test('determineWinner correctly declares winner or detects a close tie', () => {
  const options = ['A', 'B'];
  const clearMatrix = {
    A: { percentage: 85 },
    B: { percentage: 60 },
  };
  const clearPC = {
    A: { netScore: 10 },
    B: { netScore: -5 },
  };

  const clearOutcome = determineWinner(options, clearMatrix, clearPC);
  assert.equal(clearOutcome.winner, 'A');
  assert.equal(clearOutcome.isTie, false);
  assert.ok(clearOutcome.margin > 10);

  // Near tie condition
  const tieMatrix = {
    A: { percentage: 70 },
    B: { percentage: 71 },
  };
  const tiePC = {
    A: { netScore: 4 },
    B: { netScore: 3.5 },
  };
  const tieOutcome = determineWinner(options, tieMatrix, tiePC);
  assert.equal(tieOutcome.isTie, true);
  assert.equal(tieOutcome.winner, 'Tie');
});

test('validateDecisionInput checks input constraints', () => {
  assert.equal(validateDecisionInput('', ['A', 'B']).isValid, false);
  assert.equal(validateDecisionInput('Car', ['Tesla']).isValid, false); // only 1 option
  assert.equal(validateDecisionInput('Car', ['Tesla', 'Tesla']).isValid, false); // duplicate
  assert.equal(validateDecisionInput('Which vehicle should I purchase?', ['Tesla Model 3', 'Hyundai Ioniq 5']).isValid, true);
});
