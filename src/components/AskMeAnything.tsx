import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ListOrdered,
  Copy,
  Check,
  Brain,
  Zap,
  TrendingUp,
  RefreshCw,
  Scale
} from 'lucide-react';
import { AIProvider } from '../types/decision';
import { AskAnythingResult, generateOfflineAskSolution } from '../utils/askAnythingEngine';

interface AskMeAnythingProps {
  onTransferToDecisionMatrix?: (title: string, options: string[]) => void;
  initialQuestion?: string;
  contextTitle?: string;
}

export function AskMeAnything({
  onTransferToDecisionMatrix,
  initialQuestion = '',
  contextTitle,
}: AskMeAnythingProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<AskAnythingResult | null>(null);
  const [history, setHistory] = useState<AskAnythingResult[]>([]);
  const [copied, setCopied] = useState(false);

  const SAMPLE_QUESTIONS = [
    {
      label: 'Options: Sell vs Roll Call?',
      query: 'Options strategy for CVS / WMT 96C: Sell to close or hold through expiration?',
      category: 'Options Trading',
    },
    {
      label: 'Career: Counteroffer or Leave?',
      query: 'Should I accept a 25% salary counteroffer from my current company or join a high-growth startup?',
      category: 'Career',
    },
    {
      label: 'Real Estate: Buy vs Rent Now?',
      query: 'Should I buy a home with 7% mortgage interest or rent and invest the difference into the S&P 500?',
      category: 'Real Estate',
    },
    {
      label: 'Tech: Monolith vs Microservices?',
      query: 'When should a growing engineering team migrate from a modular monolith to microservices?',
      category: 'Engineering',
    },
  ];

  const handleAsk = async (customQ?: string) => {
    const qToSubmit = (customQ || question).trim();
    if (!qToSubmit) return;

    setIsLoading(true);
    setCopied(false);

    try {
      let result: AskAnythingResult | null = null;

      // Try backend endpoint
      try {
        const response = await fetch('/api/ask-anything', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: qToSubmit,
            context: contextTitle ? `Related Decision: ${contextTitle}` : undefined,
            provider: selectedProvider,
          }),
        });

        if (response.ok) {
          result = await response.json();
        }
      } catch (networkErr) {
        console.warn('Backend unavailable, using client-side domain solver');
      }

      // Offline / GitHub Pages fallback
      if (!result) {
        result = generateOfflineAskSolution(qToSubmit, selectedProvider);
      }

      setCurrentResult(result);
      setHistory((prev) => [result!, ...prev.filter((h) => h.id !== result!.id).slice(0, 5)]);
    } catch (err) {
      console.error('Error in Ask Me Anything:', err);
      const fallback = generateOfflineAskSolution(qToSubmit, selectedProvider);
      setCurrentResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleCopySolution = () => {
    if (!currentResult) return;
    const text = `Q: ${currentResult.question}\n\nSolution (${currentResult.model}):\n${currentResult.directAnswer}\n\nKey Takeaways:\n${currentResult.keyTakeaways.map((t) => `• ${t}`).join('\n')}\n\nAction Plan:\n${currentResult.actionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nRisk Warning:\n${currentResult.riskOrCaveats}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Ask Me Anything (AMA)</span>
            <span className="text-slate-400">•</span>
            <span className="text-indigo-600">ChatGPT Reasoning Engine</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-indigo-600" />
            Ask Any Question & Get Immediate Strategic Solutions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Powered by ChatGPT (GPT-4o) & Claude 3.5 Sonnet. Ask about options trading, investment theses, career crossroads, tech architecture, or any high-stakes dilemma.
          </p>
        </div>

        {/* Model Selector Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedProvider('openai')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedProvider === 'openai'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="OpenAI ChatGPT (GPT-4o)"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>ChatGPT (GPT-4o)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProvider('claude')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedProvider === 'claude'
                ? 'bg-white text-indigo-800 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Anthropic Claude 3.5 Sonnet"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            <span>Claude 3.5</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProvider('grok')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedProvider === 'grok'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="xAI Grok-2"
          >
            <span>Grok-2</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProvider('gemini')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedProvider === 'gemini'
                ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Google Gemini 2.5 Flash"
          >
            <span>Gemini</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Try a prompt:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(s.query);
                handleAsk(s.query);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 hover:border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer text-left"
            >
              <TrendingUp className="w-3 h-3 text-indigo-600 shrink-0" />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question Input Field */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Type any question or dilemma... (e.g. 'What is the current gold trend?', 'Buy vs Rent in today\'s market?')"
            className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-hidden transition-all text-slate-900 placeholder-slate-600 font-medium resize-none"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <span className="text-[11px] text-slate-600 hidden sm:inline font-mono">
              Press ⌘+Enter
            </span>
            <button
              type="button"
              disabled={isLoading || !question.trim()}
              onClick={() => handleAsk()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Get Solution</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-6 rounded-2xl border border-indigo-100 bg-indigo-50/40 animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-200" />
            <div className="h-4 bg-indigo-200 rounded-md w-48" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-indigo-100 rounded-md w-full" />
            <div className="h-3 bg-indigo-100 rounded-md w-5/6" />
            <div className="h-3 bg-indigo-100 rounded-md w-4/6" />
          </div>
        </div>
      )}

      {/* Answer & Solution Display Card */}
      {!isLoading && currentResult && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 p-6 space-y-6 shadow-xs">
          {/* Solution Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                <Brain className="w-3 h-3 text-indigo-600" />
                {currentResult.model}
              </span>
              {currentResult.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {currentResult.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {currentResult.confidenceScore || 98}% Domain Match
              </span>
              <span className="text-xs text-slate-600 font-mono">
                Generated at {currentResult.timestamp}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySolution}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copy Solution</span>
                  </>
                )}
              </button>

              {currentResult.suggestedOptionsForMatrix && currentResult.suggestedOptionsForMatrix.length >= 2 && onTransferToDecisionMatrix && (
                <button
                  type="button"
                  onClick={() => {
                    onTransferToDecisionMatrix(
                      currentResult.question,
                      currentResult.suggestedOptionsForMatrix!
                    );
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Build Full Decision Matrix</span>
                </button>
              )}
            </div>
          </div>

          {/* User's Question Highlight */}
          <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 flex items-start gap-2">
            <span className="text-indigo-600 font-bold shrink-0">Query:</span>
            <span>"{currentResult.question}"</span>
          </div>

          {/* Direct Answer */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Strategic Solution & Recommendation
            </h3>
            <div className="text-sm text-slate-800 leading-relaxed space-y-3 font-normal whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200/60 shadow-2xs">
              {currentResult.directAnswer}
            </div>
          </div>

          {/* Two-Column Grid: Key Takeaways & Action Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Takeaways */}
            {currentResult.keyTakeaways && currentResult.keyTakeaways.length > 0 && (
              <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Strategic Principles
                </h4>
                <ul className="space-y-2">
                  {currentResult.keyTakeaways.map((point, i) => (
                    <li key={i} className="text-xs text-slate-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Steps */}
            {currentResult.actionSteps && currentResult.actionSteps.length > 0 && (
              <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-indigo-600" />
                  Next Executable Action Steps
                </h4>
                <ol className="space-y-2">
                  {currentResult.actionSteps.map((step, i) => (
                    <li key={i} className="text-xs text-slate-800 flex items-start gap-2 font-medium">
                      <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Risks & Traps Warning */}
          {currentResult.riskOrCaveats && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Downside Risks & Critical Traps to Avoid
                </h4>
                <p className="text-xs text-amber-950 leading-relaxed font-medium">
                  {currentResult.riskOrCaveats}
                </p>
              </div>
            </div>
          )}

          {/* Transfer Options Prompt */}
          {currentResult.suggestedOptionsForMatrix && currentResult.suggestedOptionsForMatrix.length >= 2 && onTransferToDecisionMatrix && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  Compare in Decision Matrix
                </span>
                <p className="text-xs text-slate-300">
                  Detected options:{' '}
                  <span className="font-bold text-white font-mono">
                    {currentResult.suggestedOptionsForMatrix.join(' vs ')}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onTransferToDecisionMatrix(
                    currentResult.question,
                    currentResult.suggestedOptionsForMatrix!
                  );
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              >
                <span>Launch Weighted Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* History Drawer / Past Questions */}
      {history.length > 1 && (
        <div className="border-t border-slate-100 pt-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Recent Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {history.slice(1).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setQuestion(item.question);
                  setCurrentResult(item);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all text-left max-w-xs truncate cursor-pointer"
                title={item.question}
              >
                "{item.question}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
