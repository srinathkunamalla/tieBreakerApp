import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DecisionForm } from './components/DecisionForm';
import { VerdictBanner } from './components/VerdictBanner';
import { ProsConsView } from './components/ProsConsView';
import { ComparisonMatrixView } from './components/ComparisonMatrixView';
import { SWOTView } from './components/SWOTView';
import { InteractiveToolkit } from './components/InteractiveToolkit';
import { SavedDecisionsModal } from './components/SavedDecisionsModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { DecisionResult, AnalysisTab, Criterion, CriterionScore, ProConItem } from './types/decision';
import { determineWinner, calculateMatrixScores, calculateProsConsScore } from './utils/decisionLogic';
import { generateLocalDecisionAnalysis } from './utils/decisionEngine';
import { Scale, CheckSquare, Table2, Grid2X2, Sparkles, Compass } from 'lucide-react';

const STORAGE_KEY = 'the_tie_breaker_saved_dossiers';

export default function App() {
  const [activeResult, setActiveResult] = useState<DecisionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalysisTab>('all');
  const [savedDecisions, setSavedDecisions] = useState<DecisionResult[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load saved dossiers from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setSavedDecisions(JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to load saved decisions:', e);
    }
  }, []);

  const saveToLocalStorage = (list: DecisionResult[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setSavedDecisions(list);
    } catch (e) {
      console.error('Failed to save decisions to storage:', e);
    }
  };

  const handleAnalyzeDecision = async (
    title: string,
    options: string[],
    context: string,
    mode: string
  ) => {
    setIsLoading(true);
    try {
      let result: DecisionResult | null = null;

      try {
        const response = await fetch('/api/analyze-decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, options, context, mode }),
        });

        if (response.ok) {
          result = await response.json();
        }
      } catch (networkErr) {
        console.warn('Backend API unavailable (e.g. running on static host like GitHub Pages). Utilizing local decision engine.');
      }

      // If backend was not reached or returned error (e.g. static host like GitHub Pages)
      if (!result) {
        result = generateLocalDecisionAnalysis(title, options, context);
      }

      setActiveResult(result);
      if (mode === 'pros_cons') setActiveTab('pros_cons');
      else if (mode === 'comparison') setActiveTab('comparison');
      else if (mode === 'swot') setActiveTab('swot');
      else setActiveTab('all');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error analyzing decision:', err);
      // Ensure failure never leaves the user stranded
      const fallback = generateLocalDecisionAnalysis(title, options, context);
      setActiveResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Save current decision
  const isCurrentSaved = activeResult
    ? savedDecisions.some((d) => d.decisionId === activeResult.decisionId)
    : false;

  const handleToggleSave = () => {
    if (!activeResult) return;
    if (isCurrentSaved) {
      const filtered = savedDecisions.filter((d) => d.decisionId !== activeResult.decisionId);
      saveToLocalStorage(filtered);
    } else {
      const updated = [activeResult, ...savedDecisions];
      saveToLocalStorage(updated);
    }
  };

  const handleDeleteSaved = (id: string) => {
    const filtered = savedDecisions.filter((d) => d.decisionId !== id);
    saveToLocalStorage(filtered);
  };

  // Handle Updates from Interactive Matrix / ProsCons
  const handleUpdateCriteria = (updatedCriteria: Criterion[]) => {
    if (!activeResult) return;
    const updated = {
      ...activeResult,
      comparisonMatrix: {
        ...activeResult.comparisonMatrix,
        criteria: updatedCriteria,
      },
    };
    recalculateWinner(updated);
  };

  const handleUpdateScores = (updatedScores: Record<string, Record<string, CriterionScore>>) => {
    if (!activeResult) return;
    const updated = {
      ...activeResult,
      comparisonMatrix: {
        ...activeResult.comparisonMatrix,
        scores: updatedScores,
      },
    };
    recalculateWinner(updated);
  };

  const handleUpdateProsCons = (
    updatedProsCons: Record<string, { pros: ProConItem[]; cons: ProConItem[] }>
  ) => {
    if (!activeResult) return;
    const updated = {
      ...activeResult,
      prosCons: updatedProsCons,
    };
    recalculateWinner(updated);
  };

  // Dynamically re-evaluate lead winner when user changes sliders or items
  const recalculateWinner = (curr: DecisionResult) => {
    const matrixScores = calculateMatrixScores(
      curr.options,
      curr.comparisonMatrix.criteria,
      curr.comparisonMatrix.scores
    );

    const pcScores: Record<string, { netScore: number }> = {};
    curr.options.forEach((opt) => {
      const pc = curr.prosCons[opt] || { pros: [], cons: [] };
      pcScores[opt] = calculateProsConsScore(pc.pros, pc.cons);
    });

    const outcome = determineWinner(curr.options, matrixScores, pcScores);

    // If winner shifted, update recommendation
    if (outcome.winner !== curr.recommendation.winner) {
      curr = {
        ...curr,
        recommendation: {
          ...curr.recommendation,
          winner: outcome.winner,
          verdictHeadline: outcome.isTie
            ? `Deadlock: Your personalized criteria score these virtually even`
            : `${outcome.winner} moves into the lead based on your custom weight adjustments`,
        },
      };
    }
    setActiveResult(curr);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        savedCount={savedDecisions.length}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onNewDecision={() => {
          setActiveResult(null);
          setActiveTab('all');
        }}
        hasActiveResult={!!activeResult}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {!activeResult ? (
          /* Landing & Input Screen */
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Hero Banner */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                <span>Executive Decision Support Engine</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Stop overthinking. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-amber-500">
                  Break the tie with clarity.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-700 max-w-xl mx-auto font-medium">
                Provide any difficult life, career, or business decision. The AI generates weighted pros & cons, an interactive criteria comparison table, and a deep SWOT matrix to reveal the superior path.
              </p>
            </div>

            {/* Input Form Component */}
            <DecisionForm onSubmit={handleAnalyzeDecision} isLoading={isLoading} />
          </div>
        ) : (
          /* Active Results Dossier */
          <div className="space-y-8 animate-fade-in">
            {/* Verdict Hero Banner */}
            <VerdictBanner
              result={activeResult}
              isSaved={isCurrentSaved}
              onToggleSave={handleToggleSave}
              onOpenExport={() => setIsExportModalOpen(true)}
              onJumpToCoinFlip={() => {
                setActiveTab('tie_breaker');
                const el = document.getElementById('analysis-tabs-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Navigation Tabs for Analytical Lenses */}
            <div id="analysis-tabs-section" className="border-b border-slate-200">
              <div className="flex flex-wrap gap-2 sm:gap-4 -mb-px">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'all'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-700 hover:text-slate-900 hover:border-slate-300'
                  }`}
                  aria-label="View All Analyses"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Complete Dossier</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('pros_cons')}
                  className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'pros_cons'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-700 hover:text-slate-900 hover:border-slate-300'
                  }`}
                  aria-label="View Pros and Cons"
                >
                  <CheckSquare className="w-4 h-4 text-emerald-800" />
                  <span>Pros & Cons</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('comparison')}
                  className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'comparison'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-700 hover:text-slate-900 hover:border-slate-300'
                  }`}
                  aria-label="View Comparison Table"
                >
                  <Table2 className="w-4 h-4 text-blue-800" />
                  <span>Comparison Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('swot')}
                  className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'swot'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-700 hover:text-slate-900 hover:border-slate-300'
                  }`}
                  aria-label="View SWOT Analysis"
                >
                  <Grid2X2 className="w-4 h-4 text-purple-800" />
                  <span>SWOT Analysis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tie_breaker')}
                  className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'tie_breaker'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-700 hover:text-slate-900 hover:border-slate-300'
                  }`}
                  aria-label="View Decision Toolkit"
                >
                  <Compass className="w-4 h-4 text-amber-800" />
                  <span>Decision Toolkit</span>
                </button>
              </div>
            </div>

            {/* Rendered Analytical Lens Views */}
            {activeTab === 'all' && (
              <div className="space-y-12">
                {/* 1. Comparison Matrix */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Table2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-xl font-extrabold text-slate-900">
                      1. Multi-Criteria Comparison Table
                    </h3>
                  </div>
                  <ComparisonMatrixView
                    options={activeResult.options}
                    criteria={activeResult.comparisonMatrix.criteria}
                    scores={activeResult.comparisonMatrix.scores}
                    onUpdateCriteria={handleUpdateCriteria}
                    onUpdateScores={handleUpdateScores}
                  />
                </section>

                {/* 2. Pros & Cons */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckSquare className="w-5 h-5 text-emerald-800" />
                    <h3 className="text-xl font-extrabold text-slate-900">
                      2. Weighted Pros & Cons Breakdown
                    </h3>
                  </div>
                  <ProsConsView
                    options={activeResult.options}
                    prosCons={activeResult.prosCons}
                    onUpdateProsCons={handleUpdateProsCons}
                    winnerOption={activeResult.recommendation.winner}
                  />
                </section>

                {/* 3. SWOT Matrix */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Grid2X2 className="w-5 h-5 text-purple-800" />
                    <h3 className="text-xl font-extrabold text-slate-900">
                      3. SWOT Matrix & Cross-Strategic TOWS
                    </h3>
                  </div>
                  <SWOTView
                    options={activeResult.options}
                    swotData={activeResult.swot}
                    winnerOption={activeResult.recommendation.winner}
                  />
                </section>

                {/* 4. Interactive Toolkit */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Compass className="w-5 h-5 text-amber-800" />
                    <h3 className="text-xl font-extrabold text-slate-900">
                      4. Intuition Toolkit, 10/10/10 Rule & Pre-Mortem
                    </h3>
                  </div>
                  <InteractiveToolkit result={activeResult} />
                </section>
              </div>
            )}

            {activeTab === 'pros_cons' && (
              <ProsConsView
                options={activeResult.options}
                prosCons={activeResult.prosCons}
                onUpdateProsCons={handleUpdateProsCons}
                winnerOption={activeResult.recommendation.winner}
              />
            )}

            {activeTab === 'comparison' && (
              <ComparisonMatrixView
                options={activeResult.options}
                criteria={activeResult.comparisonMatrix.criteria}
                scores={activeResult.comparisonMatrix.scores}
                onUpdateCriteria={handleUpdateCriteria}
                onUpdateScores={handleUpdateScores}
              />
            )}

            {activeTab === 'swot' && (
              <SWOTView
                options={activeResult.options}
                swotData={activeResult.swot}
                winnerOption={activeResult.recommendation.winner}
              />
            )}

            {activeTab === 'tie_breaker' && (
              <InteractiveToolkit result={activeResult} />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <SavedDecisionsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={(dec) => setActiveResult(dec)}
        onDeleteDecision={handleDeleteSaved}
      />

      {activeResult && (
        <ExportSummaryModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          result={activeResult}
        />
      )}
    </div>
  );
}
