import React, { useState } from 'react';
import { Trophy, AlertTriangle, CheckCircle2, Bookmark, BookmarkCheck, Share2, Sparkles, Compass } from 'lucide-react';
import { DecisionResult } from '../types/decision';

interface VerdictBannerProps {
  result: DecisionResult;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenExport: () => void;
  onJumpToCoinFlip: () => void;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({
  result,
  isSaved,
  onToggleSave,
  onOpenExport,
  onJumpToCoinFlip,
}) => {
  const { recommendation, title } = result;
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isTie = recommendation.winner.toLowerCase() === 'tie';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/60">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-indigo-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  The Official Tie Breaker
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  AI Verdict
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                {isTie ? 'Deadlock Detected — Near 50/50 Balance' : `Recommended Choice: ${recommendation.winner}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSave}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isSaved
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-indigo-900/60 hover:bg-indigo-800 text-white border border-indigo-700/50'
              }`}
              aria-label={isSaved ? "Saved to Dossiers" : "Save to Dossiers"}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Saved' : 'Save Dossier'}</span>
            </button>

            <button
              onClick={onOpenExport}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-900/60 hover:bg-indigo-800 text-white border border-indigo-700/50 transition-all"
              aria-label="Export or Share Decision"
            >
              <Share2 className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Confidence & Headline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
          {/* Confidence Dial */}
          <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">
              Confidence Level
            </span>
            <div className="relative flex items-center justify-center my-2">
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-indigo-200">
                {recommendation.confidenceScore}%
              </div>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-indigo-400 to-amber-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${recommendation.confidenceScore}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-slate-400 mt-2">
              {recommendation.confidenceScore >= 80
                ? 'High Strategic Decisiveness'
                : recommendation.confidenceScore >= 65
                ? 'Moderate Asymmetric Edge'
                : 'Close Call / Subjective Trade-off'}
            </span>
          </div>

          {/* Verdict Headline & Reasoning */}
          <div className="md:col-span-9 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-amber-200 leading-snug">
              &ldquo;{recommendation.verdictHeadline}&rdquo;
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-normal">
              {recommendation.verdictReasoning}
            </p>
          </div>
        </div>

        {/* The Decisive Tie-Breaker Factor Box */}
        <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-transparent border-l-4 border-amber-400 rounded-r-2xl p-4 sm:p-5 my-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                The Tie-Breaker Pivot Point
              </div>
              <p className="text-sm font-medium text-slate-100 mt-1 leading-relaxed">
                {recommendation.tieBreakerFactor}
              </p>
            </div>
          </div>
        </div>

        {/* Action Plan & Irreversible Risk Warning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 pt-4 border-t border-indigo-800/40">
          {/* Action Steps */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Immediate Action Plan
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                {Object.values(completedSteps).filter(Boolean).length} / {recommendation.actionPlan.length} ready
              </span>
            </div>

            <div className="space-y-2.5">
              {recommendation.actionPlan.map((step, idx) => {
                const isChecked = !!completedSteps[idx];
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isChecked ? 'bg-indigo-950/40 text-slate-400' : 'bg-white/5 hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStep(idx)}
                      className="mt-1 w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 focus:ring-offset-slate-900 border-slate-600 bg-slate-800"
                    />
                    <span className={`text-xs font-medium leading-relaxed ${isChecked ? 'line-through text-slate-500' : ''}`}>
                      {step}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Risk Warning & Gut Check Trigger */}
          <div className="space-y-4 flex flex-col justify-between">
            {recommendation.irreversibleRiskWarning && (
              <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                      Irreversible Downside Guardrail
                    </h4>
                    <p className="text-xs text-rose-100/90 mt-1 leading-relaxed">
                      {recommendation.irreversibleRiskWarning}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-indigo-900/40 border border-indigo-700/40 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-indigo-200">
                  Still feeling a lingering hesitation?
                </div>
                <p className="text-[11px] text-slate-400">
                  Test your true subconscious preference with the 3-second coin flip intuition test.
                </p>
              </div>
              <button
                type="button"
                onClick={onJumpToCoinFlip}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shrink-0 transition-colors"
              >
                Coin Flip Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
