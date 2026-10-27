import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, TrendingUp, ShieldAlert, ArrowUpRight, Target } from 'lucide-react';
import { OptionSWOT } from '../types/decision';

interface SWOTViewProps {
  options: string[];
  swotData: Record<string, OptionSWOT>;
  winnerOption: string;
}

export const SWOTView: React.FC<SWOTViewProps> = ({
  options,
  swotData,
  winnerOption,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(options[0] || '');
  const [strategyTab, setStrategyTab] = useState<'so' | 'st' | 'wo' | 'wt'>('so');

  const currentSwot = swotData[selectedOption] || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    strategies: { so: [], st: [], wo: [], wt: [] },
  };

  return (
    <div className="space-y-6">
      {/* Header and Option Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Strategic SWOT Quadrant Analysis
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Executive Matrix
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Separates internal factors (Strengths & Weaknesses) from external market dynamics (Opportunities & Threats).
          </p>
        </div>

        {/* Option Tabs */}
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const isWinner = opt === winnerOption;
            const isSelected = opt === selectedOption;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSelectedOption(opt)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{opt}</span>
                {isWinner && <span className="text-amber-400 font-black">★ Winner</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2x2 SWOT Quadrant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="bg-emerald-50/50 border border-emerald-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-emerald-950">Strengths</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Internal Positive</span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              {currentSwot.strengths.length} Factors
            </span>
          </div>

          <ul className="space-y-2.5">
            {currentSwot.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-rose-50/50 border border-rose-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-rose-200/60 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-rose-950">Weaknesses</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Internal Negative</span>
              </div>
            </div>
            <span className="text-xs font-black text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded-full">
              {currentSwot.weaknesses.length} Factors
            </span>
          </div>

          <ul className="space-y-2.5">
            {currentSwot.weaknesses.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="bg-indigo-50/50 border border-indigo-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-200/60 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-indigo-950">Opportunities</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">External Positive</span>
              </div>
            </div>
            <span className="text-xs font-black text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded-full">
              {currentSwot.opportunities.length} Factors
            </span>
          </div>

          <ul className="space-y-2.5">
            {currentSwot.opportunities.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Threats */}
        <div className="bg-amber-50/50 border border-amber-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-amber-950">Threats</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">External Negative</span>
              </div>
            </div>
            <span className="text-xs font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
              {currentSwot.threats.length} Factors
            </span>
          </div>

          <ul className="space-y-2.5">
            {currentSwot.threats.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cross-Strategic Synthesis (TOWS) */}
      {currentSwot.strategies && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Cross-Quadrant Action Strategies for {selectedOption}
            </h4>
          </div>

          <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-100 pb-3">
            {[
              { id: 'so', label: 'SO (Strengths + Opportunities)', desc: 'Attack Strategy' },
              { id: 'st', label: 'ST (Strengths + Threats)', desc: 'Shield Strategy' },
              { id: 'wo', label: 'WO (Weaknesses + Opportunities)', desc: 'Pivot Strategy' },
              { id: 'wt', label: 'WT (Weaknesses + Threats)', desc: 'Defense Strategy' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStrategyTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  strategyTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            {strategyTab === 'so' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Attack / Maxi-Maxi Strategy
                </div>
                {currentSwot.strategies.so?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {strategyTab === 'st' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                  Shield / Maxi-Mini Strategy
                </div>
                {currentSwot.strategies.st?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {strategyTab === 'wo' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Remedy / Mini-Maxi Strategy
                </div>
                {currentSwot.strategies.wo?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {strategyTab === 'wt' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Survival / Mini-Mini Defense
                </div>
                {currentSwot.strategies.wt?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
