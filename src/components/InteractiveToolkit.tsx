import React, { useState } from 'react';
import { HelpCircle, RefreshCw, Send, Sparkles, Brain, Eye, Clock, MessageSquareQuote } from 'lucide-react';
import { DecisionResult } from '../types/decision';
import { generateLocalChatResponse } from '../utils/decisionEngine';

interface InteractiveToolkitProps {
  result: DecisionResult;
}

export const InteractiveToolkit: React.FC<InteractiveToolkitProps> = ({ result }) => {
  const { options, blindspots, gutCheckQuestions, title, recommendation } = result;

  // Coin Flip State
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<string | null>(null);
  const [coinCount, setCoinCount] = useState(0);

  // 10-10-10 Tab State
  const [tenHorizon, setTenHorizon] = useState<'10min' | '10mo' | '10yr'>('10mo');

  // Devil's Advocate Chat State
  const [userQuestion, setUserQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);

  const optA = options[0] || 'Option A';
  const optB = options[1] || 'Option B';

  const handleFlipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setCoinResult(null);

    setTimeout(() => {
      const winner = Math.random() < 0.5 ? optA : optB;
      setCoinResult(winner);
      setIsFlipping(false);
      setCoinCount((c) => c + 1);
    }, 1400);
  };

  const handleSendClarify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim() || chatLoading) return;

    const q = userQuestion.trim();
    setUserQuestion('');
    setChatHistory((prev) => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);

    try {
      let answer = '';
      try {
        const res = await fetch('/api/chat-clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q,
            decisionTitle: title,
            options,
            recommendation,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          answer = data.answer;
        }
      } catch (e) {
        // Fallback for static hosting
      }

      if (!answer) {
        answer = generateLocalChatResponse(q, title, options, recommendation);
      }

      setChatHistory((prev) => [...prev, { role: 'ai', text: answer }]);
    } catch (err) {
      const fallback = generateLocalChatResponse(q, title, options, recommendation);
      setChatHistory((prev) => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Grid: Coin Flip & 10/10/10 Rule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Psychological Coin Flip */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-500" />
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  The Subconscious Coin Flip Test
                </h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Psychological Gut Check
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mb-4">
              Freud & Kahneman observed: <em>“When faced with two choices, toss a coin. While the coin is in the air, you suddenly know what you are hoping for.”</em>
            </p>
          </div>

          <div className="py-4 my-2 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg transition-all ${
                  isFlipping
                    ? 'animate-coin-flip border-amber-400 bg-gradient-to-tr from-amber-400 to-amber-200'
                    : coinResult
                    ? 'border-indigo-500 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white'
                    : 'border-slate-300 bg-white text-slate-400'
                }`}
              >
                {isFlipping ? (
                  <RefreshCw className="w-8 h-8 text-amber-900 animate-spin" />
                ) : coinResult ? (
                  <span className="text-xl font-black text-center px-1">
                    {coinResult.slice(0, 3)}
                  </span>
                ) : (
                  <Sparkles className="w-8 h-8 text-slate-300" />
                )}
              </div>
            </div>

            {coinResult && !isFlipping && (
              <div className="mt-4 text-center px-4 animate-fade-in">
                <div className="text-xs font-semibold text-slate-700">The coin landed on:</div>
                <div className="text-base font-extrabold text-indigo-900 mt-0.5">
                  &ldquo;{coinResult}&rdquo;
                </div>
                <div className="mt-2 p-2.5 rounded-lg bg-indigo-50 text-indigo-900 text-xs font-medium border border-indigo-100 max-w-sm">
                  ⚡ <strong>The Moment of Truth:</strong> Did you feel an instant flash of relief or quiet disappointment? That immediate emotional spike is your true subconscious priority.
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleFlipCoin}
            disabled={isFlipping}
            className="w-full mt-3 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFlipping ? 'animate-spin' : ''}`} />
            <span>{coinCount === 0 ? `Toss Coin Between Top 2 Choices` : `Flip Again (${optA} vs ${optB})`}</span>
          </button>
        </div>

        {/* 10 / 10 / 10 Rule Simulator */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Suzy Welch&rsquo;s 10 / 10 / 10 Rule
                </h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Temporal Perspective
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mb-4">
              Breaks short-term emotional panic by viewing the decision across three distinct time horizons:
            </p>

            <div className="flex gap-2 mb-4">
              {[
                { id: '10min', label: '10 Minutes' },
                { id: '10mo', label: '10 Months' },
                { id: '10yr', label: '10 Years' },
              ].map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setTenHorizon(h.id as any)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    tenHorizon === h.id ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 min-h-[130px] flex items-center">
              {tenHorizon === '10min' && (
                <div className="text-xs text-slate-800 leading-relaxed">
                  <strong className="block text-slate-950 font-bold mb-1">In 10 Minutes:</strong>
                  You will feel an acute rush of anxiety and FOMO, questioning whether you gave up certainty. This is normal autonomic nervous system reaction to cutting off options. Do not mistake temporary discomfort for a bad choice.
                </div>
              )}
              {tenHorizon === '10mo' && (
                <div className="text-xs text-slate-800 leading-relaxed">
                  <strong className="block text-slate-950 font-bold mb-1">In 10 Months:</strong>
                  The new routine is completely normalized. If you picked <em>{recommendation.winner}</em>, you will have accumulated nearly a year of compounding skill or financial traction. The acute anxiety from today will be totally forgotten.
                </div>
              )}
              {tenHorizon === '10yr' && (
                <div className="text-xs text-slate-800 leading-relaxed">
                  <strong className="block text-slate-950 font-bold mb-1">In 10 Years:</strong>
                  You will only remember whether you took ambitious, growth-oriented calculated bets or retreated into safe stagnation. Regret of omission (not trying) compounds far worse than regret of commission.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-700 font-medium">
            💡 Pro-Tip: Almost all bad decisions stem from optimizing for the 10-minute horizon at the expense of the 10-year horizon.
          </div>
        </div>
      </div>

      {/* Blindspots & Gut Check Probes */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-rose-500" />
          <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Cognitive Blindspots & Pre-Mortem Probes
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Hidden Assumptions & Traps:
            </div>
            {blindspots.map((b, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-slate-800 font-medium leading-relaxed flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Intuitive Gut-Check Questions:
            </div>
            {gutCheckQuestions.map((q, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800 font-medium leading-relaxed flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Devil's Advocate AI Chatbox */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Consult The Tie Breaker Advisor (What-If & Scenario Testing)
            </h4>
          </div>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            AI Devil&rsquo;s Advocate
          </span>
        </div>
        <p className="text-xs text-slate-700 mb-4">
          Ask a specific follow-up (e.g. &ldquo;What if I have to move in 2 years?&rdquo; or &ldquo;How does this affect my burnout risk?&rdquo;):
        </p>

        {chatHistory.length > 0 && (
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white ml-8 font-medium'
                    : 'bg-white border border-slate-200 text-slate-900 mr-8'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                  {msg.role === 'user' ? 'You' : 'The Tie Breaker'}
                </div>
                {msg.text}
              </div>
            ))}
            {chatLoading && (
              <div className="text-xs text-slate-700 italic flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Strategizing scenarios...</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSendClarify} className="flex gap-2">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Ask a what-if scenario or stress-test question..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
            disabled={chatLoading}
          />
          <button
            type="submit"
            disabled={chatLoading || !userQuestion.trim()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Consult</span>
          </button>
        </form>
      </div>
    </div>
  );
};
