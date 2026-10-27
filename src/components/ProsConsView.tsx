import React, { useState } from 'react';
import { PlusCircle, MinusCircle, Plus, Trash2, ArrowRight } from 'lucide-react';
import { ProConItem } from '../types/decision';
import { calculateProsConsScore } from '../utils/decisionLogic';

interface ProsConsViewProps {
  options: string[];
  prosCons: Record<string, { pros: ProConItem[]; cons: ProConItem[] }>;
  onUpdateProsCons: (updated: Record<string, { pros: ProConItem[]; cons: ProConItem[] }>) => void;
  winnerOption: string;
}

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  options,
  prosCons,
  onUpdateProsCons,
  winnerOption,
}) => {
  const [activeTabOption, setActiveTabOption] = useState<string>(options[0] || '');
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<'pro' | 'con'>('pro');
  const [newWeight, setNewWeight] = useState<number>(4);
  const [newCategory, setNewCategory] = useState<ProConItem['category']>('General');
  const [newImpact, setNewImpact] = useState<ProConItem['impact']>('medium');
  const [showAddModalFor, setShowAddModalFor] = useState<string | null>(null);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Financial': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Career': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Life Quality': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Risk': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Growth': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Effort': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Alignment': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getImpactBadge = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">High Impact</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">Medium</span>;
      case 'low':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">Minor</span>;
    }
  };

  const handleDeleteItem = (opt: string, type: 'pro' | 'con', id: string) => {
    const current = prosCons[opt] || { pros: [], cons: [] };
    const updated = {
      ...prosCons,
      [opt]: {
        pros: type === 'pro' ? current.pros.filter((p) => p.id !== id) : current.pros,
        cons: type === 'con' ? current.cons.filter((c) => c.id !== id) : current.cons,
      },
    };
    onUpdateProsCons(updated);
  };

  const handleAddItem = (opt: string) => {
    if (!newText.trim()) return;
    const current = prosCons[opt] || { pros: [], cons: [] };
    const newItem: ProConItem = {
      id: `custom_${Date.now()}`,
      text: newText.trim(),
      weight: Number(newWeight) || 3,
      category: newCategory,
      impact: newImpact,
    };

    const updated = {
      ...prosCons,
      [opt]: {
        pros: newType === 'pro' ? [...current.pros, newItem] : current.pros,
        cons: newType === 'con' ? [...current.cons, newItem] : current.cons,
      },
    };

    onUpdateProsCons(updated);
    setNewText('');
    setShowAddModalFor(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Multi-Dimensional Pros & Cons Evaluation
          </h3>
          <p className="text-xs text-slate-700 mt-0.5">
            Each point is weighted (1-5) and amplified by emotional/strategic impact (High: 1.3x multiplier).
          </p>
        </div>

        {/* Option quick filter buttons */}
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const current = prosCons[opt] || { pros: [], cons: [] };
            const score = calculateProsConsScore(current.pros, current.cons);
            const isWinner = opt === winnerOption;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => setActiveTabOption(opt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTabOption === opt
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{opt}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  score.netScore >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {score.netScore >= 0 ? `+${score.netScore}` : score.netScore}
                </span>
                {isWinner && <span className="text-amber-300">★</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Options Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {options.map((opt) => {
          const current = prosCons[opt] || { pros: [], cons: [] };
          const score = calculateProsConsScore(current.pros, current.cons);
          const isWinner = opt === winnerOption;
          const isSelected = activeTabOption === opt;

          return (
            <div
              key={opt}
              className={`bg-white rounded-2xl border transition-all ${
                isSelected
                  ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
                        {opt}
                      </h4>
                      {isWinner && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                          Front-runner
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-700 mt-1 flex items-center gap-2">
                      <span>Pros total: <strong className="text-emerald-800 font-bold">+{score.proScore}</strong></span>
                      <span>•</span>
                      <span>Cons total: <strong className="text-rose-800 font-bold">-{score.conScore}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold uppercase text-slate-700">Net Balance</div>
                    <div className={`text-2xl font-black ${
                      score.netScore > 0 ? 'text-emerald-800' : score.netScore < 0 ? 'text-rose-800' : 'text-slate-800'
                    }`}>
                      {score.netScore > 0 ? `+${score.netScore}` : score.netScore}
                    </div>
                  </div>
                </div>

                {/* Score Ratio Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{
                        width: score.proScore + score.conScore > 0
                          ? `${(score.proScore / (score.proScore + score.conScore)) * 100}%`
                          : '50%',
                      }}
                      title={`Pros: ${score.proScore}`}
                    ></div>
                    <div
                      className="bg-rose-500 h-full transition-all"
                      style={{
                        width: score.proScore + score.conScore > 0
                          ? `${(score.conScore / (score.proScore + score.conScore)) * 100}%`
                          : '50%',
                      }}
                      title={`Cons: ${score.conScore}`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Pros & Cons Columns */}
              <div className="p-5 space-y-6">
                {/* Pros List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                      <PlusCircle className="w-4 h-4 text-emerald-700" />
                      <span>The Pros ({current.pros.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModalFor(opt);
                        setNewType('pro');
                      }}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Pro</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {current.pros.length === 0 ? (
                      <p className="text-xs text-slate-700 italic py-2">No pros listed yet.</p>
                    ) : (
                      current.pros.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/80 transition-colors group flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1.5 flex-1">
                            <p className="text-xs font-medium text-slate-800 leading-snug">
                              {item.text}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                              {getImpactBadge(item.impact)}
                              <span className="text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                Weight: {item.weight}/5
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(opt, 'pro', item.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity"
                            aria-label="Delete this pro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Cons List */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-800">
                      <MinusCircle className="w-4 h-4 text-rose-700" />
                      <span>The Cons ({current.cons.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModalFor(opt);
                        setNewType('con');
                      }}
                      className="text-[11px] font-bold text-rose-800 hover:text-rose-900 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Con</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {current.cons.length === 0 ? (
                      <p className="text-xs text-slate-700 italic py-2">No cons listed yet.</p>
                    ) : (
                      current.cons.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100/80 transition-colors group flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1.5 flex-1">
                            <p className="text-xs font-medium text-slate-800 leading-snug">
                              {item.text}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                              {getImpactBadge(item.impact)}
                              <span className="text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                Weight: {item.weight}/5
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(opt, 'con', item.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity"
                            aria-label="Delete this con"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Inline Add Item Form if active */}
                {showAddModalFor === opt && (
                  <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900">
                        Add New {newType === 'pro' ? 'Pro' : 'Con'} to {opt}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddModalFor(null)}
                        className="text-xs text-slate-700 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                    </div>

                    <input
                      type="text"
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder={`Enter custom ${newType} statement...`}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                      autoFocus
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Category</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as any)}
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="Career">Career</option>
                          <option value="Financial">Financial</option>
                          <option value="Life Quality">Life Quality</option>
                          <option value="Risk">Risk</option>
                          <option value="Growth">Growth</option>
                          <option value="Effort">Effort</option>
                          <option value="Alignment">Alignment</option>
                          <option value="General">General</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Impact Level</label>
                        <select
                          value={newImpact}
                          onChange={(e) => setNewImpact(e.target.value as any)}
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="high">High (1.3x)</option>
                          <option value="medium">Medium (1.0x)</option>
                          <option value="low">Low (0.7x)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Weight (1-5)</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={newWeight}
                          onChange={(e) => setNewWeight(Number(e.target.value))}
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddItem(opt)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      Save to {opt}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
