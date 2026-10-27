import test from 'node:test';
import assert from 'node:assert/strict';
import { extractTickerSymbol } from './tickerExtractor';

test('extractTickerSymbol identifies CVS from options trade dilemma', () => {
  const symbol = extractTickerSymbol('should I do Options trading for CVS 96C 10/30', ['Sell', 'Hold']);
  assert.equal(symbol, 'CVS');
});

test('extractTickerSymbol identifies dollar prefixed tickers', () => {
  const symbol = extractTickerSymbol('Should I buy $NVDA or stay in cash?', ['Buy', 'Wait']);
  assert.equal(symbol, 'NVDA');
});

test('extractTickerSymbol identifies pattern like AAPL 200C', () => {
  const symbol = extractTickerSymbol('Evaluate AAPL 250C expiration trade', ['Close', 'Exercise']);
  assert.equal(symbol, 'AAPL');
});

test('extractTickerSymbol returns null when no financial ticker is present', () => {
  const symbol = extractTickerSymbol('Should I move to Amsterdam or stay in Chicago?', ['Move', 'Stay']);
  assert.equal(symbol, null);
});
