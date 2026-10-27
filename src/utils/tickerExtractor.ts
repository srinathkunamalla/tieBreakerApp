/**
 * Extracts stock, crypto, or ETF ticker symbols from decision titles or options
 */
export function extractTickerSymbol(title: string, options: string[] = []): string | null {
  const fullText = `${title} ${options.join(' ')}`;

  // Direct match for known popular tickers
  const commonTickers = [
    'CVS', 'AAPL', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'MSFT', 'AMZN', 'GOOGL', 'META',
    'AMD', 'NFLX', 'DIS', 'COIN', 'PLTR', 'BABA', 'BA', 'JPM', 'BAC', 'WMT',
    'BTC', 'ETH', 'SOL', 'XOM', 'CVX', 'LLY', 'UNH', 'V', 'MA', 'COST'
  ];

  for (const ticker of commonTickers) {
    const regex = new RegExp(`\\b${ticker}\\b`, 'i');
    if (regex.test(fullText)) {
      return ticker.toUpperCase();
    }
  }

  // Look for patterns like "96C", "$TICKER", or standalone uppercase 2-5 letter symbols
  const dollarMatch = fullText.match(/\$([A-Z]{1,5})\b/);
  if (dollarMatch) return dollarMatch[1].toUpperCase();

  const optionsCallMatch = fullText.match(/\b([A-Z]{1,5})\s+\d+[CP]\b/i);
  if (optionsCallMatch) return optionsCallMatch[1].toUpperCase();

  return null;
}
