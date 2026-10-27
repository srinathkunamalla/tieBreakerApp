import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, ChevronDown, ChevronUp, HelpCircle, Layers } from 'lucide-react';
import { SAMPLE_DECISIONS } from '../data/sampleDecisions';
import { SampleDecision } from '../types/decision';

interface DecisionFormProps {
  onSubmit: (title: string, options: string[], context: string, mode: string) => void;
  isLoading: boolean;
}

export const DecisionForm: React.FC<DecisionFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'all' | 'pros_cons' | 'comparison' | 'swot'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
    if (errorMessage) setErrorMessage(null);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
    }
  };

  const loadPreset = (preset: SampleDecision) => {
    setTitle(preset.title);
    setOptions([...preset.options]);
    setContext(preset.context);
    setShowContext(true);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);

    if (!cleanTitle) {
      setErrorMessage('Please describe the decision you need to make.');
      return;
    }

    if (cleanOptions.length < 2) {
      setErrorMessage('Please provide at least 2 distinct alternatives to evaluate.');
      return;
    }

    const uniqueSet = new Set(cleanOptions.map((o) => o.toLowerCase()));
    if (uniqueSet.size !== cleanOptions.length) {
      setErrorMessage('Each option must be distinct from the others.');
      return;
    }

    setErrorMessage(null);
    onSubmit(cleanTitle, cleanOptions, context.trim(), analysisMode);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
      {/* Sample Presets Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Inspiration Presets</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_DECISIONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(preset)}
              className="text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 hover:border-indigo-200 rounded-lg px-2.5 py-1.5 transition-all text-left flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Decision Title */}
        <div>
          <label htmlFor="decision-title" className="block text-sm font-bold text-slate-900 mb-2">
            What decision are you trying to resolve? <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="decision-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Should I accept the startup offer or stay at my current tech job?"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-slate-900 placeholder-slate-400 text-base font-medium transition-all"
              required
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-700">
            State the core question or choice you find yourself debating.
          </p>
        </div>

        {/* Options to Compare */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-900">
              The Competing Options <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-700 font-medium">
              {options.length} / 5 options
            </span>
          </div>

          <div className="space-y-3">
            {options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100/70 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {letter}
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${letter} (e.g. ${idx === 0 ? 'Accept Startup Offer' : 'Stay in Current Role'})`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all"
                    aria-label={`Option ${letter}`}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      aria-label={`Remove Option ${letter}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {options.length < 5 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add another alternative</span>
            </button>
          )}
        </div>

        {/* Collapsible Context Section */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowContext(!showContext)}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors"
            aria-expanded={showContext}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">
                Personal Priorities, Constraints & Anxieties (Recommended)
              </span>
            </div>
            {showContext ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showContext && (
            <div className="p-4 bg-white border-t border-slate-200">
              <label htmlFor="decision-context" className="block text-xs font-medium text-slate-700 mb-1.5">
                Share any timeline constraints, financial stakes, family impact, or non-negotiables:
              </label>
              <textarea
                id="decision-context"
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. My primary focus is career acceleration over the next 3 years. I have 6 months emergency fund. I care deeply about creative autonomy but worry about startup burnout..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 placeholder-slate-400 text-sm font-normal transition-all"
              />
              <p className="mt-1 text-[11px] text-slate-700">
                The AI incorporates these exact factors into custom criterion weights and risk calculations.
              </p>
            </div>
          )}
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Analysis Architecture</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'all', title: 'Complete Dossier', desc: 'Pros/Cons, Matrix & SWOT' },
              { id: 'pros_cons', title: 'Pros & Cons', desc: 'Weighted trade-off list' },
              { id: 'comparison', title: 'Criteria Matrix', desc: 'Scored comparison table' },
              { id: 'swot', title: 'SWOT Analysis', desc: 'Strategic quadrants' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setAnalysisMode(mode.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  analysisMode === mode.id
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`text-xs font-bold ${analysisMode === mode.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {mode.title}
                </div>
                <div className="text-[11px] text-slate-700 truncate mt-0.5">
                  {mode.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Submit CTA */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base text-white shadow-lg transition-all flex items-center justify-center gap-2.5 ${
              isLoading
                ? 'bg-indigo-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 shadow-indigo-500/25 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Evaluating Trade-Offs & Calculating Weights...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Break The Tie & Generate Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
