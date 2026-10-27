import React from 'react';
import { Scale, BookmarkCheck, Sparkles, PlusCircle } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  onNewDecision: () => void;
  hasActiveResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSaved,
  onNewDecision,
  hasActiveResult,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onNewDecision}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          aria-label="The Tie Breaker Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                The Tie Breaker
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                AI Matrix
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium hidden sm:block">
              Pros & Cons • Weighted Matrix • SWOT Analysis
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {hasActiveResult && (
            <button
              onClick={onNewDecision}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              aria-label="Create New Decision"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">New Decision</span>
            </button>
          )}

          <button
            onClick={onOpenSaved}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors relative"
            aria-label={`View Saved Decisions (${savedCount})`}
          >
            <BookmarkCheck className="w-4 h-4 text-amber-600" />
            <span>Saved Dossiers</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
