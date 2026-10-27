import test from 'node:test';
import assert from 'node:assert';
import { generateOfflineAskSolution } from './askAnythingEngine.js';

test('generateOfflineAskSolution handles Gold trend query with deep macroeconomic analysis', () => {
  const result = generateOfflineAskSolution('What is the current gold trend', 'openai');
  assert.strictEqual(result.provider, 'openai');
  assert.strictEqual(result.category, 'Commodities & Macroeconomics');
  assert.ok(
    result.directAnswer.toLowerCase().includes('gold') ||
    result.directAnswer.toLowerCase().includes('central bank'),
    'Should discuss gold and central bank accumulation'
  );
  assert.ok(
    !result.directAnswer.toLowerCase().includes('5% rule') &&
    !result.directAnswer.toLowerCase().includes('mortgage payment'),
    'Must NOT return real estate / 5% rule response for gold query!'
  );
  assert.ok(result.keyTakeaways.length >= 3, 'Should have key takeaways');
  assert.ok(result.actionSteps.length >= 3, 'Should have action steps');
  assert.ok(result.suggestedOptionsForMatrix && result.suggestedOptionsForMatrix.some(o => o.toLowerCase().includes('gold')));
});

test('generateOfflineAskSolution does not confuse words with "rent" (like current, different) with Real Estate', () => {
  const queries = [
    'What is the current gold trend',
    'What is the current market sentiment',
    'What are the current tech architecture trends',
  ];

  for (const q of queries) {
    const result = generateOfflineAskSolution(q, 'claude');
    assert.ok(
      !result.directAnswer.toLowerCase().includes('5% rule') &&
      !result.directAnswer.toLowerCase().includes('mortgage payment'),
      `Query "${q}" should not be classified as real estate housing rent!`
    );
  }
});

test('generateOfflineAskSolution handles options trading questions with Theta and IV analysis', () => {
  const result = generateOfflineAskSolution(
    'Should I do Options trading for CVS 96C 10/30 with option as Sell or Hold?',
    'openai'
  );
  assert.strictEqual(result.provider, 'openai');
  assert.match(result.model, /ChatGPT/i);
  assert.ok(
    result.directAnswer.includes('Theta') || result.directAnswer.includes('options'),
    'Should discuss options mechanics'
  );
  assert.ok(result.keyTakeaways.length >= 3, 'Should have key takeaways');
  assert.ok(result.actionSteps.length >= 3, 'Should have action steps');
  assert.ok(result.riskOrCaveats.length > 0, 'Should have risk warnings');
  assert.ok(
    result.suggestedOptionsForMatrix && result.suggestedOptionsForMatrix.length >= 2,
    'Should provide matrix options'
  );
});

test('generateOfflineAskSolution handles Walmart options trading inquiry', () => {
  const result = generateOfflineAskSolution(
    'What should I do with my WMT 100C call option expiring Friday?',
    'claude'
  );
  assert.strictEqual(result.provider, 'claude');
  assert.match(result.model, /Claude/i);
  assert.ok(
    result.directAnswer.includes('WMT') || result.directAnswer.includes('Theta'),
    'Should reference WMT or Theta'
  );
  assert.ok(result.actionSteps.length >= 3);
});

test('generateOfflineAskSolution handles Silver & Commodities inquiry', () => {
  const result = generateOfflineAskSolution('What is the outlook for silver and crude oil?', 'grok');
  assert.strictEqual(result.category, 'Commodities & Energy');
  assert.ok(result.directAnswer.includes('Silver') || result.directAnswer.includes('Crude Oil'));
});

test('generateOfflineAskSolution handles Career crossroads questions', () => {
  const result = generateOfflineAskSolution(
    'Should I accept a counteroffer or leave for a new job?',
    'openai'
  );
  assert.ok(result.directAnswer.toLowerCase().includes('counteroffer'));
  assert.ok(result.keyTakeaways.length > 0);
  assert.ok(result.suggestedOptionsForMatrix?.includes('Accept New External Offer'));
});

test('generateOfflineAskSolution handles Real Estate questions with housing context', () => {
  const result = generateOfflineAskSolution(
    'Should I buy a house now with high interest rates or rent an apartment and invest?',
    'grok'
  );
  assert.strictEqual(result.provider, 'grok');
  assert.ok(result.directAnswer.toLowerCase().includes('rent'));
  assert.ok(result.riskOrCaveats.length > 0);
  assert.strictEqual(result.category, 'Real Estate & Housing');
});

test('generateOfflineAskSolution handles dynamic novel query intelligently', () => {
  const result = generateOfflineAskSolution(
    'How should I structure my 4-day work week experiment?',
    'gemini'
  );
  assert.ok(result.directAnswer.length > 100);
  assert.ok(result.actionSteps.length >= 3);
  assert.ok(result.keyTakeaways.length >= 3);
});
