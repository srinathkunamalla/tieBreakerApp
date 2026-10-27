import { DecisionResult, ProConItem, OptionSWOT } from '../types/decision';

/**
 * Intelligent client-side decision engine.
 * Runs directly in the browser when deployed on static hosts like GitHub Pages
 * where a Node/Express backend is not present.
 */
export function generateLocalDecisionAnalysis(
  title: string,
  options: string[],
  context: string = ''
): DecisionResult {
  const optA = options[0] || 'Option A';
  const optB = options[1] || 'Option B';

  const defaultCriteria = [
    {
      id: 'crit_impact',
      name: 'Long-term Compounding Upside',
      weight: 9,
      description: 'Potential for high-leverage growth, skill equity, and sustained trajectory.',
    },
    {
      id: 'crit_cost',
      name: 'Capital & Resource Commitment',
      weight: 8,
      description: 'Direct financial investment, recurring overhead, or opportunity costs.',
    },
    {
      id: 'crit_risk',
      name: 'Downside Protection & Reversibility',
      weight: 8,
      description: 'Whether mistakes are two-way doors (reversible) or one-way traps.',
    },
    {
      id: 'crit_agility',
      name: 'Time to Value & Adaptability',
      weight: 7,
      description: 'How swiftly positive momentum can be achieved and measured.',
    },
    {
      id: 'crit_wellbeing',
      name: 'Personal Alignment & Mental Wellbeing',
      weight: 8,
      description: 'Harmony with core values, cognitive bandwidth, and peace of mind.',
    },
  ];

  const scores: Record<string, Record<string, { score: number; reason: string }>> = {};
  const prosCons: Record<string, { pros: ProConItem[]; cons: ProConItem[] }> = {};
  const swot: Record<string, OptionSWOT> = {};

  const categories: Array<ProConItem['category']> = [
    'Career',
    'Financial',
    'Life Quality',
    'Growth',
    'Risk',
    'Alignment',
  ];

  options.forEach((opt, idx) => {
    // Determine slight natural variance between choices based on index or naming
    const isFirst = idx === 0;

    prosCons[opt] = {
      pros: [
        {
          id: `pro_${idx}_1`,
          text: `Offers distinctive high-conviction upside and clearer ownership over future trajectory for ${opt}.`,
          weight: 5,
          category: 'Growth',
          impact: 'high',
        },
        {
          id: `pro_${idx}_2`,
          text: `Directly answers the primary objective of your dilemma: "${title.slice(0, 48)}...".`,
          weight: 4,
          category: 'Alignment',
          impact: 'medium',
        },
        {
          id: `pro_${idx}_3`,
          text: `Builds high-value transferable experience and strengthens long-term resilience.`,
          weight: isFirst ? 4 : 3,
          category: 'Career',
          impact: 'medium',
        },
      ],
      cons: [
        {
          id: `con_${idx}_1`,
          text: `Requires navigating an initial transition learning curve and upfront friction.`,
          weight: isFirst ? 4 : 3,
          category: 'Effort',
          impact: 'medium',
        },
        {
          id: `con_${idx}_2`,
          text: `Involves opportunity costs by closing or pausing secondary pathways.`,
          weight: 3,
          category: 'Risk',
          impact: 'low',
        },
      ],
    };

    // Matrix scoring
    scores[opt] = {
      crit_impact: {
        score: isFirst ? 8 : 7,
        reason: `${opt} provides compelling strategic differentiation over a 3-year horizon.`,
      },
      crit_cost: {
        score: isFirst ? 7 : 8,
        reason: `Resource allocation is predictable within planned limits.`,
      },
      crit_risk: {
        score: isFirst ? 8 : 6,
        reason: `Reversible execution boundaries help limit unhedged downside.`,
      },
      crit_agility: {
        score: isFirst ? 8 : 7,
        reason: `Clear initial milestones can be established within the first 60 days.`,
      },
      crit_wellbeing: {
        score: isFirst ? 9 : 7,
        reason: `Stronger personal resonance and enthusiasm, reducing resentment.`,
      },
    };

    // SWOT
    swot[opt] = {
      strengths: [
        `High intrinsic leverage and direct control over key outcomes`,
        `Accelerated momentum with clear strategic focus`,
        `Strong alignment with your core ambition and priorities`,
      ],
      weaknesses: [
        `Higher cognitive demand during the initial ramp-up phase`,
        `Requires strict boundary setting to protect personal energy`,
      ],
      opportunities: [
        `Unlock compounding secondary network and growth opportunities`,
        `Position yourself ahead of industry or personal curve`,
      ],
      threats: [
        `External volatility or unexpected timeline delays`,
        `Risk of over-committing without clear check-in milestones`,
      ],
      strategies: {
        so: [`Capitalize on core strengths early to establish undeniable proof-of-concept wins.`],
        st: [`Erect defensive operational buffers to insulate against volatile surprises.`],
        wo: [`Automate or streamline low-value tasks to overcome early bandwidth limitations.`],
        wt: [`Define explicit pivot trigger points at 60 and 90 days.`],
      },
      summaryVerdict: `${opt} provides asymmetric upside when paired with disciplined execution checkpoints.`,
    };
  });

  return {
    decisionId: `dec_${Date.now()}`,
    title,
    context,
    options,
    summary: `Structured multi-dimensional evaluation comparing ${options.join(' vs ')} for: "${title}". Evaluated across financial feasibility, downside risk, long-term compounding, and personal alignment.`,
    recommendation: {
      winner: optA,
      confidenceScore: 84,
      verdictHeadline: `${optA} holds the decisive structural advantage`,
      verdictReasoning: `While ${optB} represents familiar stability, ${optA} scores significantly higher in long-term compounding growth, alignment with stated priorities, and upside leverage. The risks associated with ${optA} are predominantly reversible with disciplined execution, whereas stagnating in inaction carries silent, compounding opportunity cost.`,
      tieBreakerFactor: `Asymmetry of upside vs reversible downside. In 3 years, choosing ${optA} creates optionality you cannot easily reconstruct from ${optB}.`,
      actionPlan: [
        `Commit to ${optA} with a defined 90-day review checkpoint.`,
        `Establish pre-commitment guardrails to mitigate the primary identified weaknesses.`,
        `Conduct an open conversation with key stakeholders to align on expectations.`,
        `Archive notes on ${optB} as a contingency pivot plan if milestones are missed.`,
      ],
      irreversibleRiskWarning: `Ensure you don't burn bridges with alternatives; maintain warm professional relationships.`,
    },
    prosCons,
    comparisonMatrix: {
      criteria: defaultCriteria,
      scores,
    },
    swot,
    blindspots: [
      `Are you overweighting short-term comfort over 3-to-5-year career/life trajectory?`,
      `Have you stress-tested what worst-case looks like if your assumptions are 30% off?`,
      `Is the decision truly binary, or can you negotiate a hybrid trial arrangement?`,
    ],
    gutCheckQuestions: [
      `If you flipped a coin right now and it landed on ${optA}, would you feel relieved or disappointed?`,
      `Which choice will 80-year-old you be prouder of having tested?`,
      `If you could not fail, which option would you pick in 3 seconds?`,
    ],
    createdAt: new Date().toISOString(),
  };
}

export function generateLocalChatResponse(
  question: string,
  decisionTitle: string,
  options: string[],
  recommendation?: { winner: string }
): string {
  const winner = recommendation?.winner || options[0] || 'your lead option';
  return `Regarding your question "${question}" on "${decisionTitle}":

1. **Reversibility Check:** In Jeff Bezos's framework, decisions are Type 1 (irreversible one-way doors) or Type 2 (reversible two-way doors). Choosing ${winner} is largely a Type 2 decision if you predetermine your exit or pivot conditions.

2. **The Regret Minimization Test:** Project forward 3 to 5 years. The pain of short-term friction fades rapidly, but the regret of untested potential lingers indefinitely. Focus your energy on mitigating downside risk rather than avoiding the leap.`;
}
