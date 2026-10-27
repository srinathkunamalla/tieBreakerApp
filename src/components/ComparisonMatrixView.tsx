import React, { useState } from 'react';
import { Sliders, Plus, Trophy, Info, Sparkles, Check } from 'lucide-react';
import { Criterion, CriterionScore } from '../types/decision';
import { calculateMatrixScores } from '../utils/decisionLogic';

interface ComparisonMatrixViewProps {
  options: string[];
  criteria: Criterion[];
  scores: Record<string, Record<string, CriterionScore>>;
  onUpdateCriteria: (updatedCriteria: Criterion[]) => void;
  onUpdateScores: (updatedScores: Record<string, Record<string, CriterionScore>>) => void;
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  options,
  criteria,
  scores,
  onUpdateCriteria,
  onUpdateScores,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCritName, setNewCritName] = useState('');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(8);

  const matrixResults = calculateMatrixScores(options, criteria, scores);

  // Find overall highest scoring option in matrix
  let highestOption = options[0];
  let highestPercentage = -1;
  options.forEach((opt) => {
    const pct = matrixResults[opt]?.percentage ?? 0;
    if (pct > highestPercentage) {
      highestPercentage = pct;
      highestOption = opt;
    }
  });

  const handleWeightChange = (critId: string, newWeight: number) => {
    const updated = criteria.map((c) => (c.id === critId ? { ...c, weight: newWeight } : c));
    onUpdateCriteria(updated);
  };

  const handleScoreChange = (opt: string, critId: string, newScore: number) => {
    const currentOptScores = scores[opt] || {};
    const updated = {
      ...scores,
      [opt]: {
        ...currentOptScores,
        [critId]: {
          score: newScore,
          reason: currentOptScores[critId]?.reason || 'User adjusted score',
        },
      },
    };
    onUpdateScores(updated);
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;

    const newId = `crit_custom_${Date.now()}`;
    const newCriterion: Criterion = {
      id: newId,
      name: newCritName.trim(),
      weight: Number(newCritWeight) || 5,
      description: newCritDesc.trim() || 'Custom user criterion',
    };

    const updatedCriteria = [...criteria, newCriterion];

    // Seed default scores for options
    const updatedScores = { ...scores };
    options.forEach((opt) => {
      if (!updatedScores[opt]) updatedScores[opt] = {};
      updatedScores[opt][newId] = {
        score: 7,
        reason: 'Initial baseline evaluation',
      };
    });

    onUpdateCriteria(updatedCriteria);
    onUpdateScores(updatedScores);
    setNewCritName('');
    setNewCritDesc('');
    setShowAddModal(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    if (score >= 6) return 'text-blue-800 bg-blue-50 border-blue-200';
    if (score >= 4) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-rose-800 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Table explanation & add button */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Weighted Multi-Criteria Decision Matrix
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Interactive Sliders
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Drag the importance weights (1-10) to calibrate how heavily each criterion matters to you. Total scores recalculate live.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Criterion</span>
        </button>
      </div>

      {/* Comparison Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="py-4 px-5 text-xs font-black uppercase tracking-wider text-slate-700 w-1/3 min-w-[240px]">
                  Evaluation Criteria & Importance
                </th>
                {options.map((opt) => {
                  const isLeader = opt === highestOption;
                  return (
                    <th
                      key={opt}
                      className={`py-4 px-5 text-xs font-black uppercase tracking-wider min-w-[200px] ${
                        isLeader ? 'bg-indigo-50/70 text-indigo-950 border-x border-indigo-100' : 'text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{opt}</span>
                        {isLeader && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-400 text-slate-950 shrink-0">
                            <Trophy className="w-3 h-3" />
                            <span>Lead</span>
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {criteria.map((crit) => {
                // Find top score for this row
                let maxRowScore = -1;
                options.forEach((opt) => {
                  const s = scores[opt]?.[crit.id]?.score ?? 0;
                  if (s > maxRowScore) maxRowScore = s;
                });

                return (
                  <tr key={crit.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Criterion Info & Weight Slider */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-2">
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{crit.name}</div>
                          {crit.description && (
                            <p className="text-xs text-slate-700 leading-snug mt-0.5">{crit.description}</p>
                          )}
                        </div>

                        {/* Weight Slider */}
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                            <span className="flex items-center gap-1 font-semibold">
                              <Sliders className="w-3 h-3 text-indigo-500" />
                              Importance Weight:
                            </span>
                            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.2 rounded border border-indigo-200">
                              {crit.weight} / 10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={crit.weight}
                            onChange={(e) => handleWeightChange(crit.id, Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            aria-label={`Weight for ${crit.name}`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Option Scores */}
                    {options.map((opt) => {
                      const itemScore = scores[opt]?.[crit.id] || { score: 5, reason: 'Average rating' };
                      const isTopInRow = itemScore.score === maxRowScore && maxRowScore > 0;

                      return (
                        <td
                          key={opt}
                          className={`py-4 px-5 align-top ${
                            opt === highestOption ? 'bg-indigo-50/30 border-x border-indigo-100/60' : ''
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${getScoreColor(itemScore.score)}`}>
                                {itemScore.score} / 10
                              </span>
                              {isTopInRow && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Best
                                </span>
                              )}
                            </div>

                            {/* Score adjuster stepper */}
                            <div className="flex items-center gap-1">
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={itemScore.score}
                                onChange={(e) => handleScoreChange(opt, crit.id, Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                aria-label={`Score for ${opt} on ${crit.name}`}
                              />
                            </div>

                            {/* Reason justification */}
                            <p className="text-xs text-slate-700 leading-relaxed font-normal">
                              {itemScore.reason}
                            </p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            {/* Total Weighted Score Summary Row */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-extrabold border-t-2 border-slate-700">
                <td className="py-5 px-5">
                  <div className="text-sm font-black tracking-tight text-amber-300">
                    Total Weighted Score
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    Sum of (Criterion Weight × Score) normalized to 100%
                  </div>
                </td>

                {options.map((opt) => {
                  const res = matrixResults[opt] || { totalWeightedScore: 0, percentage: 50 };
                  const isLeader = opt === highestOption;

                  return (
                    <td
                      key={opt}
                      className={`py-5 px-5 ${
                        isLeader ? 'bg-indigo-950/80 border-x border-indigo-600' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-black ${isLeader ? 'text-amber-300' : 'text-white'}`}>
                            {res.percentage}%
                          </span>
                          <span className="text-xs text-slate-400">
                            ({res.totalWeightedScore} pts)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isLeader ? 'bg-amber-400' : 'bg-indigo-400'
                            }`}
                            style={{ width: `${res.percentage}%` }}
                          ></div>
                        </div>
                        {isLeader && (
                          <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 pt-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Matrix Winner (+{res.percentage - (matrixResults[options.find((o) => o !== highestOption) || '']?.percentage || 0)}% margin)</span>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Criterion Modal / Slide-in */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h4 className="text-base font-extrabold text-slate-900 mb-1">
              Add Custom Evaluation Criterion
            </h4>
            <p className="text-xs text-slate-700 mb-4">
              Introduce a specific personal or business factor to compare all choices against.
            </p>

            <form onSubmit={handleAddCriterion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Criterion Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCritName}
                  onChange={(e) => setNewCritName(e.target.value)}
                  placeholder="e.g. Learning Velocity, Geographic Freedom, Cultural Fit"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Clarifying Context
                </label>
                <input
                  type="text"
                  value={newCritDesc}
                  onChange={(e) => setNewCritDesc(e.target.value)}
                  placeholder="e.g. How much autonomy and skill compounding this unlocks"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span className="font-bold">Initial Importance Weight:</span>
                  <span className="font-extrabold text-indigo-600">{newCritWeight} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newCritWeight}
                  onChange={(e) => setNewCritWeight(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Insert Criterion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
