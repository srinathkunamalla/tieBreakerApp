export interface ProConItem {
  id: string;
  text: string;
  weight: number; // 1 to 5
  category: 'Financial' | 'Career' | 'Life Quality' | 'Risk' | 'Growth' | 'Effort' | 'Alignment' | 'General';
  impact: 'high' | 'medium' | 'low';
}

export interface Criterion {
  id: string;
  name: string;
  weight: number; // 1 to 10
  description: string;
}

export interface CriterionScore {
  score: number; // 1 to 10
  reason: string;
}

export interface SWOTStrategies {
  so: string[]; // Strengths + Opportunities
  st: string[]; // Strengths + Threats
  wo: string[]; // Weaknesses + Opportunities
  wt: string[]; // Weaknesses + Threats
}

export interface OptionSWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategies?: SWOTStrategies;
  summaryVerdict?: string;
}

export interface DecisionResult {
  decisionId: string;
  title: string;
  context?: string;
  options: string[];
  summary: string;
  recommendation: {
    winner: string;
    confidenceScore: number; // 0 - 100
    verdictHeadline: string;
    verdictReasoning: string;
    tieBreakerFactor: string;
    actionPlan: string[];
    irreversibleRiskWarning?: string;
  };
  prosCons: Record<string, {
    pros: ProConItem[];
    cons: ProConItem[];
  }>;
  comparisonMatrix: {
    criteria: Criterion[];
    scores: Record<string, Record<string, CriterionScore>>;
  };
  swot: Record<string, OptionSWOT>;
  blindspots: string[];
  gutCheckQuestions: string[];
  createdAt: string;
}

export type AnalysisTab = 'all' | 'pros_cons' | 'comparison' | 'swot' | 'tie_breaker' | 'tradingview';

export interface SampleDecision {
  title: string;
  options: string[];
  context: string;
  tag: string;
}
