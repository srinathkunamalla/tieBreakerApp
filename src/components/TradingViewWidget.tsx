import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, Activity, Search, ExternalLink, BarChart3, AlertCircle } from 'lucide-react';

interface TradingViewWidgetProps {
  initialSymbol?: string;
  decisionTitle?: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  initialSymbol = '',
  decisionTitle = '',
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchInput, setSearchInput] = useState(initialSymbol);
  const [activeWidgetTab, setActiveWidgetTab] = useState<'technical' | 'chart'>('technical');

  const techAnalysisContainerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Normalize symbol for TradingView (e.g. CVS -> NYSE:CVS or fallback)
  const getFullSymbol = (sym: string) => {
    const clean = sym.trim().toUpperCase();
    if (clean.includes(':')) return clean;
    // Map common index/crypto tickers
    if (clean === 'SPY' || clean === 'DIA' || clean === 'CVS' || clean === 'DIS') return `NYSE:${clean}`;
    if (['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'QQQ', 'AMD'].includes(clean)) {
      return `NASDAQ:${clean}`;
    }
    if (clean === 'BTC' || clean === 'BTCUSD') return 'BINANCE:BTCUSDT';
    if (clean === 'ETH' || clean === 'ETHUSD') return 'BINANCE:ETHUSDT';
    return clean;
  };

  const currentFormattedSymbol = getFullSymbol(symbol);

  // Load Technical Analysis Widget
  useEffect(() => {
    if (activeWidgetTab !== 'technical' || !techAnalysisContainerRef.current) return;

    techAnalysisContainerRef.current.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container__widget';
    wrapper.style.height = '420px';
    wrapper.style.width = '100%';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: '1D',
      width: '100%',
      isTransparent: false,
      height: 420,
      symbol: currentFormattedSymbol,
      showIntervalTabs: true,
      displayMode: 'single',
      locale: 'en',
      colorTheme: 'light',
    });

    techAnalysisContainerRef.current.appendChild(wrapper);
    techAnalysisContainerRef.current.appendChild(script);
  }, [symbol, activeWidgetTab, currentFormattedSymbol]);

  // Load Advanced Chart Widget
  useEffect(() => {
    if (activeWidgetTab !== 'chart' || !chartContainerRef.current) return;

    chartContainerRef.current.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container__widget';
    wrapper.style.height = '480px';
    wrapper.style.width = '100%';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [[currentFormattedSymbol, `${symbol}|1D`]],
      chartOnly: false,
      width: '100%',
      height: 480,
      locale: 'en',
      colorTheme: 'light',
      autosize: false,
      showVolume: true,
      showMA: true,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: 'right',
      scaleMode: 'Normal',
      fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
      fontSize: '10',
      noTimeScale: false,
      valuesTracking: '1',
      changeMode: 'price-and-percent',
      chartType: 'area',
      maLineColor: '#2962FF',
      maLineWidth: 1,
      maLength: 9,
      lineType: 0,
    });

    chartContainerRef.current.appendChild(wrapper);
    chartContainerRef.current.appendChild(script);
  }, [symbol, activeWidgetTab, currentFormattedSymbol]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSymbol(searchInput.trim().toUpperCase());
  };

  const POPULAR_TICKERS = ['WMT', 'SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA', 'BTCUSD'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Widget Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Activity className="w-3 h-3 text-blue-400" />
              TradingView Live Market Feed
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {currentFormattedSymbol}
            </span>
          </div>
          <h4 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Live Technical Momentum & Consensus for {symbol}</span>
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time moving averages, oscillators, and trend ratings directly from TradingView.
          </p>
        </div>

        {/* Symbol Search & Popular Pills */}
        <div className="space-y-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ticker (e.g. WMT, AAPL)"
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-800 text-white border border-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 w-36 uppercase font-mono font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Update
            </button>
          </form>

          {/* Quick symbol chips */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick:</span>
            {POPULAR_TICKERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSymbol(t);
                  setSearchInput(t);
                }}
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                  symbol === t
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Widget Tabs (Technical Analysis vs Interactive Chart) */}
      <div className="px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveWidgetTab('technical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeWidgetTab === 'technical'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Technical Oscillators & Gauges</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveWidgetTab('chart')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeWidgetTab === 'chart'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Interactive Price Action Chart</span>
          </button>
        </div>

        <a
          href={`https://www.tradingview.com/symbols/${symbol}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hidden sm:flex"
        >
          <span>TradingView Full Terminal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Embedded Widget Viewports */}
      <div className="p-4 sm:p-6 bg-white min-h-[440px] flex flex-col justify-center">
        {activeWidgetTab === 'technical' && (
          <div className="w-full flex justify-center">
            <div
              ref={techAnalysisContainerRef}
              className="tradingview-widget-container w-full max-w-2xl mx-auto"
            ></div>
          </div>
        )}

        {activeWidgetTab === 'chart' && (
          <div className="w-full">
            <div
              ref={chartContainerRef}
              className="tradingview-widget-container w-full mx-auto"
            ></div>
          </div>
        )}

        {/* Tie-Breaker Decision Synthesis Banner */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-slate-50 to-amber-50 border border-indigo-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-black uppercase tracking-wider text-indigo-900">
              How Live Technicals Factor Into Your Tie Breaker:
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              If the TradingView consensus gauge signals <strong>&ldquo;Strong Sell&rdquo;</strong> or <strong>&ldquo;Sell&rdquo;</strong>, holding short-dated calls like {symbol} 96C fights both declining underlying price momentum AND rapid theta decay. Conversely, if technicals show <strong>&ldquo;Strong Buy&rdquo;</strong> with surging volume, you can justify setting a tight trailing stop-loss instead of an immediate market exit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
