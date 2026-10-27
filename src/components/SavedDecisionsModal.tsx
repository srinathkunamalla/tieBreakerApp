import React from 'react';
import { X, Trash2, ArrowRight, BookmarkCheck, Calendar } from 'lucide-react';
import { DecisionResult } from '../types/decision';

interface SavedDecisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionResult[];
  onSelectDecision: (decision: DecisionResult) => void;
  onDeleteDecision: (id: string) => void;
}

export const SavedDecisionsModal: React.FC<SavedDecisionsModalProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Saved Decision Dossiers
              </h3>
              <p className="text-xs text-slate-700">
                {savedDecisions.length} decision{savedDecisions.length === 1 ? '' : 's'} archived in local storage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Decisions List */}
        <div className="overflow-y-auto flex-1 my-4 space-y-3 pr-1">
          {savedDecisions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700">No saved decisions yet</div>
              <p className="text-xs text-slate-700 mt-1 max-w-sm mx-auto">
                After generating any decision analysis, click &ldquo;Save Dossier&rdquo; on the verdict banner to store it for future review.
              </p>
            </div>
          ) : (
            savedDecisions.map((dec) => (
              <div
                key={dec.decisionId}
                className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/30 transition-all flex items-start justify-between gap-4 group"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    onSelectDecision(dec);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Winner: {dec.recommendation.winner}
                    </span>
                    <span className="text-[11px] text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(dec.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {dec.title}
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 line-clamp-2">
                    {dec.summary}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDecision(dec);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white transition-colors"
                    title="Open this decision"
                    aria-label={`Open decision: ${dec.title}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDecision(dec.decisionId)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete saved decision"
                    aria-label={`Delete decision: ${dec.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
