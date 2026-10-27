import { DecisionResult, ProConItem, OptionSWOT, Criterion } from '../types/decision';

type DomainType =
  | 'OPTIONS_TRADING'
  | 'STOCK_INVESTING'
  | 'REAL_ESTATE_PURCHASE'
  | 'CAREER_JOB'
  | 'TECH_ARCHITECTURE'
  | 'RELOCATION_LIFE'
  | 'GENERAL_STRATEGY';

export function detectDomain(title: string, options: string[], context: string = ''): DomainType {
  const text = `${title} ${options.join(' ')} ${context}`.toLowerCase();

  // Options trading indicators: call/put, strike, 96c, expiration dates, theta, options trading, sell/hold options
  if (
    /\b(call|put|options?\s+trading|strike|\d+[cp]|\d+\/\d+|theta|expiration|expiry|dte|in the money|out of the money|otm|itm|atm|iv crush|implied volatility)\b/i.test(text) ||
    (/\b(sell|hold|buy)\b/i.test(text) && /\b(cvs|aapl|tsla|spy|qqq|nvda|amzn|msft|\d+[cp])\b/i.test(text))
  ) {
    return 'OPTIONS_TRADING';
  }

  // Stock / Crypto / General Investing
  if (/\b(stock|shares|dividend|etf|index fund|crypto|bitcoin|btc|eth|portfolio|equity investment|dollar cost)\b/i.test(text)) {
    return 'STOCK_INVESTING';
  }

  // Real estate / Home / Rent
  if (/\b(house|home|apartment|mortgage|rent|lease|suburb|down payment|real estate|property|landlord)\b/i.test(text)) {
    return 'REAL_ESTATE_PURCHASE';
  }

  // Career / Job / Startup
  if (/\b(job|offer|salary|promotion|startup|corporate|career|boss|manager|resign|quit|interview|compensation)\b/i.test(text)) {
    return 'CAREER_JOB';
  }

  // Tech / Software / Architecture
  if (/\b(build vs buy|saas|api|in-house|microservices|database|aws|cloud|framework|codebase|frontend|backend)\b/i.test(text)) {
    return 'TECH_ARCHITECTURE';
  }

  // Relocation
  if (/\b(move|relocate|relocation|city|abroad|country|apartment hunt|expat)\b/i.test(text)) {
    return 'RELOCATION_LIFE';
  }

  return 'GENERAL_STRATEGY';
}

/**
 * Generates rich, domain-accurate, highly specialized decision dossiers
 */
export function generateDomainSpecificAnalysis(
  title: string,
  options: string[],
  context: string = ''
): DecisionResult {
  const domain = detectDomain(title, options, context);
  const optA = options[0] || 'Option A';
  const optB = options[1] || 'Option B';

  if (domain === 'OPTIONS_TRADING') {
    return buildOptionsTradingAnalysis(title, options, context);
  }

  if (domain === 'STOCK_INVESTING') {
    return buildStockInvestingAnalysis(title, options, context);
  }

  if (domain === 'REAL_ESTATE_PURCHASE') {
    return buildRealEstateAnalysis(title, options, context);
  }

  if (domain === 'TECH_ARCHITECTURE') {
    return buildTechArchitectureAnalysis(title, options, context);
  }

  if (domain === 'CAREER_JOB') {
    return buildCareerAnalysis(title, options, context);
  }

  return buildGeneralStrategyAnalysis(title, options, context);
}

// -------------------------------------------------------------
// Options Trading Specialized Generator
// -------------------------------------------------------------
function buildOptionsTradingAnalysis(
  title: string,
  options: string[],
  context: string
): DecisionResult {
  // Extract key trading hints if present
  const isSellFirst = options[0]?.toLowerCase().includes('sell');
  const sellOpt = options.find((o) => /sell|close|exit|take profit/i.test(o)) || options[0];
  const holdOpt = options.find((o) => /hold|keep|ride/i.test(o)) || options[1];

  // Detect strike & expiry mentions
  const strikeMatch = title.match(/(\d+)\s*C/i) || title.match(/strike\s*(\d+)/i);
  const strikeText = strikeMatch ? `$${strikeMatch[1]} Call` : 'contract';
  const dateMatch = title.match(/(\d+\/\d+)/);
  const expiryText = dateMatch ? dateMatch[1] : 'upcoming expiration';

  const criteria: Criterion[] = [
    {
      id: 'crit_theta',
      name: 'Theta Decay & Time Horizon Risk',
      weight: 10,
      description: 'Exponential acceleration of extrinsic premium erosion as expiration approaches.',
    },
    {
      id: 'crit_profit_capture',
      name: 'Capital Preservation & Profit Realization',
      weight: 9,
      description: 'Locking in current contract value vs gambling on continued momentum.',
    },
    {
      id: 'crit_delta_upside',
      name: 'Remaining Upside Leverage (Gamma/Delta)',
      weight: 7,
      description: 'Potential for outsized gains if the underlying stock makes an aggressive breakout.',
    },
    {
      id: 'crit_breakeven_prob',
      name: 'Probability of Expiring In-The-Money (ITM)',
      weight: 9,
      description: 'Statistical likelihood of underlying trading above the strike price plus premium paid.',
    },
    {
      id: 'crit_opportunity_cost',
      name: 'Capital Efficiency & Opportunity Cost',
      weight: 7,
      description: 'Freeing up margin/cash to deploy into higher probability, lower risk setups.',
    },
  ];

  const scores: Record<string, Record<string, { score: number; reason: string }>> = {};
  const prosCons: Record<string, { pros: ProConItem[]; cons: ProConItem[] }> = {};
  const swot: Record<string, OptionSWOT> = {};

  // Build analysis for Sell
  prosCons[sellOpt] = {
    pros: [
      {
        id: 'p_sell_1',
        text: `Completely eliminates theta decay risk into the ${expiryText} expiration.`,
        weight: 5,
        category: 'Risk',
        impact: 'high',
      },
      {
        id: 'p_sell_2',
        text: `Guarantees capital preservation and locks in current option premium value.`,
        weight: 5,
        category: 'Financial',
        impact: 'high',
      },
      {
        id: 'p_sell_3',
        text: `Avoids binary expiration wipeout if the stock stalls even $0.05 below the strike.`,
        weight: 4,
        category: 'Risk',
        impact: 'medium',
      },
    ],
    cons: [
      {
        id: 'c_sell_1',
        text: `Caps further upside if the underlying stock experiences an unexpected sharp rally before ${expiryText}.`,
        weight: 4,
        category: 'Growth',
        impact: 'medium',
      },
      {
        id: 'c_sell_2',
        text: `Potential psychological regret of selling too early if the contract multiples later.`,
        weight: 3,
        category: 'Life Quality',
        impact: 'low',
      },
    ],
  };

  scores[sellOpt] = {
    crit_theta: { score: 10, reason: `100% immune to theta decay once closed.` },
    crit_profit_capture: { score: 9, reason: `Locks in tangible realized return or curtails further losses.` },
    crit_delta_upside: { score: 4, reason: `Foregoes further directional upside on this specific contract.` },
    crit_breakeven_prob: { score: 8, reason: `Guarantees known outcome without needing stock to beat expiry math.` },
    crit_opportunity_cost: { score: 9, reason: `Frees up buying power for fresh trades or rolling out.` },
  };

  swot[sellOpt] = {
    strengths: [
      `Complete elimination of time decay (Theta) and weekend gap risk`,
      `Definite cash realization with zero execution ambiguity`,
      `Disciplined risk management following the cardinal rule of options trading: take profits`,
    ],
    weaknesses: [
      `Forfeits exposure to explosive momentum moves before expiry`,
    ],
    opportunities: [
      `Can roll profits into a longer-dated expiration (e.g. 60-90 DTE) to maintain exposure with low theta`,
      `Deploy freed capital into less volatile asset classes or hedged spreads`,
    ],
    threats: [
      `Immediate post-sale rally inducing FOMO and emotional chasing`,
    ],
    strategies: {
      so: [`Lock in gains now; re-enter only if the stock confirms a breakout on heavy volume.`],
      st: [`Protect your bankroll against unpredictable broader market pullbacks or IV crush.`],
      wo: [`If still bullish, sell the near-term contract and buy a further-out expiration with lower theta.`],
      wt: [`Never hold a short-dated option hoping for a miracle bounce into expiration day.`],
    },
    summaryVerdict: `Selling secures guaranteed capital and eliminates the exponential time decay destroying your contract value.`,
  };

  // Build analysis for Hold
  prosCons[holdOpt] = {
    pros: [
      {
        id: 'p_hold_1',
        text: `Retains full upside exposure if the stock surges through the ${strikeText} strike.`,
        weight: 4,
        category: 'Growth',
        impact: 'medium',
      },
      {
        id: 'p_hold_2',
        text: `Provides maximum leverage per dollar invested if a rapid catalyst hits before ${expiryText}.`,
        weight: 3,
        category: 'Financial',
        impact: 'medium',
      },
    ],
    cons: [
      {
        id: 'c_hold_1',
        text: `Severe, accelerating Theta decay actively erodes contract value every single hour into ${expiryText}.`,
        weight: 5,
        category: 'Risk',
        impact: 'high',
      },
      {
        id: 'c_hold_2',
        text: `Binary zero risk: If the underlying stock closes even $0.01 below strike at expiration, the call expires at $0.00 (100% loss).`,
        weight: 5,
        category: 'Financial',
        impact: 'high',
      },
      {
        id: 'c_hold_3',
        text: `Implied Volatility (IV) crush after any anticipated event can deflate contract price even if stock moves up.`,
        weight: 4,
        category: 'Risk',
        impact: 'medium',
      },
    ],
  };

  scores[holdOpt] = {
    crit_theta: { score: 2, reason: `Extreme theta decay penalties as expiration approaches.` },
    crit_profit_capture: { score: 3, reason: `Subject to total loss of premium if momentum stalls.` },
    crit_delta_upside: { score: 9, reason: `Maximum delta/gamma leverage if underlying skyrockets.` },
    crit_breakeven_prob: { score: 4, reason: `Requires underlying stock to make a rapid, substantial move.` },
    crit_opportunity_cost: { score: 3, reason: `Capital remains locked in a rapidly depreciating wasting asset.` },
  };

  swot[holdOpt] = {
    strengths: [
      `Maintains uncapped directional upside if an outsized bullish move occurs`,
      `High gamma responsiveness if stock trends strongly toward the money`,
    ],
    weaknesses: [
      `Exponential extrinsic time decay eroding contract value daily`,
      `High risk of total loss (100% wipeout of contract value at 4:00 PM on expiration day)`,
    ],
    opportunities: [
      `Potential windfall return if a sudden corporate catalyst or buyout rumor hits`,
    ],
    threats: [
      `Stock trades sideways, resulting in guaranteed 100% loss due to theta`,
      `Overnight gap down or market-wide sector weakness leaving contract untradeable`,
    ],
    strategies: {
      so: [`If holding, set a strict trailing stop or profit target order right now.`],
      st: [`Hedge the position by selling a higher strike call against it (creating a vertical spread).`],
      wo: [`Cut losses immediately if the stock breaks below key support.`],
      wt: [`Do not hold all the way to 0 DTE without a defined maximum pain threshold.`],
    },
    summaryVerdict: `Holding gambles on rapid directional breakout while fighting exponential time decay every single trading session.`,
  };

  const winner = sellOpt;
  const isTie = false;

  return {
    decisionId: `dec_options_${Date.now()}`,
    title,
    context,
    options,
    summary: `Derivatives risk analysis for ${title}. Comparing ${sellOpt} vs ${holdOpt}. Evaluated against exponential theta decay, implied volatility dynamics, breakeven probabilities, and capital preservation.`,
    recommendation: {
      winner: sellOpt,
      confidenceScore: 88,
      verdictHeadline: `Sell / Take Profit: The Math Favors Capital Preservation Over Theta Bleed`,
      verdictReasoning: `Options are wasting assets governed by exponential time decay (Theta). As your contract approaches the ${expiryText} expiration, extrinsic value decays non-linearly every single session. Unless you have access to a verified imminent material catalyst that will propel the stock well above the ${strikeText} breakeven price, holding is mathematically unfavorable. ${sellOpt} locks in capital, eliminates overnight gap risk, and protects you against a 100% wipeout.`,
      tieBreakerFactor: `Exponential Theta Decay & Asymmetry of Wasting Assets. Every trading day the stock stays flat or moves sideways, your contract loses value. Selling locks in certainty; holding fights an accelerating mathematical clock.`,
      actionPlan: [
        `Check current bid/ask spread and open interest for ${strikeText} ${expiryText} to ensure good fill liquidity.`,
        `Execute a Limit Order to ${sellOpt} at or near the mid-price to avoid slippage.`,
        `If you remain fundamentally bullish on the stock, consider rolling 30-50% of the proceeds into a further-out expiration (e.g. 60-90 DTE) where theta decay is minimal.`,
        `Never hold short-dated options into expiration day hoping for a miraculous last-hour turnaround.`,
      ],
      irreversibleRiskWarning: `Out-of-the-money and near-the-money options contracts expire at exactly $0.00 at 4:00 PM on expiration day. 100% of the capital invested in the contract can be lost.`,
    },
    prosCons,
    comparisonMatrix: {
      criteria,
      scores,
    },
    swot,
    blindspots: [
      `Are you suffering from the "disposition effect" — holding onto a trade out of greed or stubborn hope rather than executing your original risk plan?`,
      `Have you calculated the exact stock breakeven price (Strike + Premium paid) required at expiration?`,
      `Is Implied Volatility (IV) currently elevated? If so, post-event IV crush will hurt contract price even if the stock rises.`,
    ],
    gutCheckQuestions: [
      `If the stock opens down 2% tomorrow morning and this contract drops 50% in 15 minutes, will you kick yourself for not selling today?`,
      `Would you buy this exact contract at today's market price with fresh cash right now? If no, you should sell it.`,
      `Are you trading with a defined risk-to-reward ratio, or gambling on a feeling?`,
    ],
    createdAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// Stock / General Investing Generator
// -------------------------------------------------------------
function buildStockInvestingAnalysis(title: string, options: string[], context: string): DecisionResult {
  const optA = options[0];
  const optB = options[1];

  const criteria: Criterion[] = [
    { id: 'c_return', name: 'Expected Risk-Adjusted Return', weight: 9, description: 'Upside potential compared to benchmark index.' },
    { id: 'c_downside', name: 'Downside Volatility & Drawdown Risk', weight: 9, description: 'Maximum historical drawdown and margin of safety.' },
    { id: 'c_liquidity', name: 'Liquidity & Capital Access', weight: 7, description: 'Ease of converting back to cash without slippage.' },
    { id: 'c_horizon', name: 'Time Horizon & Compounding Efficiency', weight: 8, description: 'Tax drag, dividend yield, and multi-year trajectory.' },
    { id: 'c_sleep', name: 'Sleep-at-Night Factor', weight: 8, description: 'Psychological peace of mind during market corrections.' },
  ];

  const scores: Record<string, Record<string, { score: number; reason: string }>> = {};
  const prosCons: Record<string, { pros: ProConItem[]; cons: ProConItem[] }> = {};
  const swot: Record<string, OptionSWOT> = {};

  options.forEach((opt, idx) => {
    const isFirst = idx === 0;
    prosCons[opt] = {
      pros: [
        { id: `p_${idx}_1`, text: `Offers clear thesis aligned with investment criteria for ${opt}.`, weight: 5, category: 'Financial', impact: 'high' },
        { id: `p_${idx}_2`, text: `Provides liquid market access and transparent pricing.`, weight: 4, category: 'Growth', impact: 'medium' },
      ],
      cons: [
        { id: `c_${idx}_1`, text: `Exposed to broader market volatility and macroeconomic headwind.`, weight: 4, category: 'Risk', impact: 'medium' },
      ],
    };

    scores[opt] = {
      c_return: { score: isFirst ? 8 : 7, reason: `Solid expected return profile.` },
      c_downside: { score: isFirst ? 7 : 8, reason: `Reasonable downside protection.` },
      c_liquidity: { score: 9, reason: `High liquidity.` },
      c_horizon: { score: 8, reason: `Strong multi-year compounding.` },
      c_sleep: { score: isFirst ? 8 : 7, reason: `Manageable emotional burden.` },
    };

    swot[opt] = {
      strengths: [`Clear investment thesis`, `Liquidity and straightforward execution`],
      weaknesses: [`Opportunity cost compared to broad index`],
      opportunities: [`Dollar-cost averaging during market pullbacks`],
      threats: [`Sector-wide multiple compression`],
      strategies: {
        so: [`Build position in tranches rather than a single lump sum.`],
        st: [`Set trailing stop-loss orders to limit capital drawdown.`],
        wo: [`Rebalance semi-annually to take emotion out of trades.`],
        wt: [`Keep an emergency cash reserve outside of market exposure.`],
      },
      summaryVerdict: `${opt} offers solid risk-adjusted return when executed with disciplined position sizing.`,
    };
  });

  return {
    decisionId: `dec_invest_${Date.now()}`,
    title,
    context,
    options,
    summary: `Portfolio allocation assessment comparing ${options.join(' vs ')} for "${title}". Analyzed across liquidity, drawdown volatility, and expected compounding return.`,
    recommendation: {
      winner: optA,
      confidenceScore: 80,
      verdictHeadline: `${optA} provides superior risk-adjusted asymmetric return`,
      verdictReasoning: `When evaluating ${options.join(' vs ')}, prioritize capital preservation and long-term compounding over speculative momentum. ${optA} maintains a stronger margin of safety and clearer fundamental catalyst.`,
      tieBreakerFactor: `Risk-adjusted Sharpe ratio and downside asymmetry. Preserving capital during downturns is mathematically more important than chasing maximum beta.`,
      actionPlan: [
        `Deploy in 3 staggered tranches over the next 4-8 weeks to smooth entry price volatility.`,
        `Establish strict profit targets and maximum drawdown stops before entering the order.`,
        `Re-evaluate the macro thesis at the end of the current fiscal quarter.`,
      ],
      irreversibleRiskWarning: `Never allocate more than 5-10% of total liquid net worth to any single non-diversified asset.`,
    },
    prosCons,
    comparisonMatrix: { criteria, scores },
    swot,
    blindspots: [
      `Are you falling for recency bias (expecting the last 3 months performance to continue)?`,
      `Have you stress-tested how your portfolio performs during a 15% broad market correction?`,
    ],
    gutCheckQuestions: [
      `If this asset drops 20% next month without fundamental news, would you want to buy more or panic sell?`,
    ],
    createdAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// Real Estate / Home Purchase Generator
// -------------------------------------------------------------
function buildRealEstateAnalysis(title: string, options: string[], context: string): DecisionResult {
  const optA = options[0];
  const optB = options[1];

  const criteria: Criterion[] = [
    { id: 'c_cashflow', name: 'Monthly Cash Flow & True Cost of Ownership', weight: 9, description: 'Mortgage, taxes, insurance, HOA, maintenance vs rent.' },
    { id: 'c_equity', name: 'Equity Compounding & Net Worth Growth', weight: 8, description: 'Principal paydown and historical asset appreciation.' },
    { id: 'c_mobility', name: 'Flexibility & Geographic Mobility', weight: 7, description: 'Ability to relocate for career promotions or life changes.' },
    { id: 'c_quality', name: 'Lifestyle Freedom & Space Satisfaction', weight: 8, description: 'Living comfort, personal autonomy, and family peace.' },
    { id: 'c_liquidity', name: 'Emergency Liquidity & Downside Protection', weight: 9, description: 'Preservation of liquid cash reserves.' },
  ];

  const scores: Record<string, Record<string, { score: number; reason: string }>> = {};
  const prosCons: Record<string, { pros: ProConItem[]; cons: ProConItem[] }> = {};
  const swot: Record<string, OptionSWOT> = {};

  options.forEach((opt, idx) => {
    const isFirst = idx === 0;
    prosCons[opt] = {
      pros: [
        { id: `p_${idx}_1`, text: `Directly satisfies your lifestyle objective for ${opt}.`, weight: 5, category: 'Life Quality', impact: 'high' },
        { id: `p_${idx}_2`, text: `Provides stability and predictable multi-year horizons.`, weight: 4, category: 'Financial', impact: 'medium' },
      ],
      cons: [
        { id: `c_${idx}_1`, text: `Requires significant upfront capital or ongoing maintenance commitment.`, weight: 4, category: 'Effort', impact: 'medium' },
      ],
    };

    scores[opt] = {
      c_cashflow: { score: isFirst ? 7 : 8, reason: `Manageable debt-to-income ratio.` },
      c_equity: { score: isFirst ? 8 : 7, reason: `Long-term asset compounding.` },
      c_mobility: { score: isFirst ? 6 : 9, reason: `Transaction costs impact mobility.` },
      c_quality: { score: isFirst ? 9 : 7, reason: `High personal enjoyment and space.` },
      c_liquidity: { score: isFirst ? 6 : 8, reason: `Requires keeping 6 months emergency cushion.` },
    };

    swot[opt] = {
      strengths: [`Provides stability and ownership`, `Forced savings mechanism through equity`],
      weaknesses: [`High closing transaction friction (6-8% upon resale)`],
      opportunities: [`Refinancing if interest rates decrease in the future`],
      threats: [`Property tax hikes or unexpected structural maintenance`],
      strategies: {
        so: [`Lock in fixed-rate financing to secure your housing expense long-term.`],
        st: [`Keep a dedicated maintenance reserve account with at least 1-2% of home value.`],
        wo: [`Compare total unrecoverable costs (property tax + interest + HOA vs rent).`],
        wt: [`Avoid buying unless planning to occupy for at least 5 to 7 years.`],
      },
      summaryVerdict: `${opt} offers compelling lifestyle stability when verified against 5-year break-even math.`,
    };
  });

  return {
    decisionId: `dec_re_${Date.now()}`,
    title,
    context,
    options,
    summary: `Real estate decision matrix comparing ${options.join(' vs ')} for "${title}". Analyzed against unrecoverable housing costs, equity compounding, mobility, and liquidity.`,
    recommendation: {
      winner: optA,
      confidenceScore: 78,
      verdictHeadline: `${optA} provides superior total utility and long-term stability`,
      verdictReasoning: `A primary residence is primarily a lifestyle consumption decision rather than an aggressive financial alpha vehicle. If your time horizon exceeds 5-7 years, ${optA} generates superior personal utility, space security, and inflation-hedged housing expenses.`,
      tieBreakerFactor: `Time Horizon & Unrecoverable Cost Threshold. If staying 5+ years, transaction costs amortize favorably, making ${optA} the structural winner.`,
      actionPlan: [
        `Calculate your total monthly unrecoverable costs (property tax + insurance + interest + HOA) vs rent.`,
        `Maintain a strict 6-month liquid emergency fund untouched by down payment or closing costs.`,
        `Get pre-approved across at least 3 distinct mortgage lenders to compare APR and origination points.`,
      ],
      irreversibleRiskWarning: `Real estate transaction friction (buying and selling costs) typically consumes 8-10% of total asset value. Do not buy if relocation is probable within 3 years.`,
    },
    prosCons,
    comparisonMatrix: { criteria, scores },
    swot,
    blindspots: [
      `Are you underestimating phantom costs: maintenance, property tax escalations, and furnishings?`,
      `Is the down payment leaving you house-rich and cash-poor?`,
    ],
    gutCheckQuestions: [
      `Do you genuinely want the responsibility of home maintenance, or do you desire the cultural milestone of ownership?`,
    ],
    createdAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// Tech Architecture / Engineering Generator
// -------------------------------------------------------------
function buildTechArchitectureAnalysis(title: string, options: string[], context: string): DecisionResult {
  const optA = options[0];
  const optB = options[1];

  const criteria: Criterion[] = [
    { id: 'c_speed', name: 'Time to Market & Velocity', weight: 9, description: 'Speed of shipping initial value to users.' },
    { id: 'c_maintenance', name: 'Long-term Maintenance & Technical Debt', weight: 8, description: 'Ongoing engineering maintenance overhead.' },
    { id: 'c_custom', name: 'Customization & Workflow Flexibility', weight: 8, description: 'Freedom from third-party vendor lock-in.' },
    { id: 'c_cost', name: 'Total Cost of Ownership (Labor + Subscriptions)', weight: 9, description: 'Engineering salaries vs software licensing fees.' },
    { id: 'c_reliability', name: 'Security, Compliance & Uptime SLA', weight: 8, description: 'Enterprise readiness and battle-tested edge case handling.' },
  ];

  const scores: Record<string, Record<string, { score: number; reason: string }>> = {};
  const prosCons: Record<string, { pros: ProConItem[]; cons: ProConItem[] }> = {};
  const swot: Record<string, OptionSWOT> = {};

  options.forEach((opt, idx) => {
    const isFirst = idx === 0;
    prosCons[opt] = {
      pros: [
        { id: `p_${idx}_1`, text: `Directly aligns with strategic engineering priorities for ${opt}.`, weight: 5, category: 'Growth', impact: 'high' },
        { id: `p_${idx}_2`, text: `Keeps team focused on core business differentiation.`, weight: 4, category: 'Effort', impact: 'medium' },
      ],
      cons: [
        { id: `c_${idx}_1`, text: `Involves trade-offs in either upfront build labor or recurring vendor fees.`, weight: 4, category: 'Financial', impact: 'medium' },
      ],
    };

    scores[opt] = {
      c_speed: { score: isFirst ? 8 : 7, reason: `Fast iteration cycle.` },
      c_maintenance: { score: isFirst ? 7 : 8, reason: `Manageable long-term surface area.` },
      c_custom: { score: isFirst ? 9 : 6, reason: `High architectural autonomy.` },
      c_cost: { score: isFirst ? 7 : 8, reason: `Predictable economic scaling.` },
      c_reliability: { score: isFirst ? 8 : 9, reason: `Strong operational stability.` },
    };

    swot[opt] = {
      strengths: [`Accelerated momentum`, `Direct alignment with product roadmap`],
      weaknesses: [`Integration friction or custom maintenance commitment`],
      opportunities: [`Focus scarce engineering talent on unique core IP`],
      threats: [`API deprecation or unexpected vendor price hikes`],
      strategies: {
        so: [`Build a fast proof-of-concept before committing multi-month engineering cycles.`],
        st: [`Isolate third-party dependencies behind an internal adapter interface.`],
        wo: [`Automate deployment pipelines to minimize operational toil.`],
        wt: [`Define explicit SLA failure pivot plans.`],
      },
      summaryVerdict: `${opt} optimizes scarce engineering capacity while delivering core reliability.`,
    };
  });

  return {
    decisionId: `dec_tech_${Date.now()}`,
    title,
    context,
    options,
    summary: `Technical architecture comparison between ${options.join(' vs ')} for "${title}". Evaluated across total cost of ownership, time to market, maintenance drag, and vendor lock-in.`,
    recommendation: {
      winner: optA,
      confidenceScore: 82,
      verdictHeadline: `${optA} maximizes team velocity and core IP focus`,
      verdictReasoning: `Engineering hours are your most expensive and scarce asset. Choosing ${optA} enables your team to ship faster while minimizing undifferentiated heavy lifting. Maintain clean interface abstractions so you retain future architectural leverage.`,
      tieBreakerFactor: `Opportunity Cost of Developer Focus. Spending engineering cycles on commodity features diverts talent away from your core competitive advantage.`,
      actionPlan: [
        `Scope an isolated 2-week spike / MVP to validate integration latency and limitations.`,
        `Draft an internal abstraction layer (Adapter pattern) so swapping backends later is a localized code change.`,
        `Establish clear latency, cost, and reliability metrics to trigger an architectural review in 6 months.`,
      ],
      irreversibleRiskWarning: `Vendor lock-in without an interface abstraction layer can make future migration prohibitively expensive.`,
    },
    prosCons,
    comparisonMatrix: { criteria, scores },
    swot,
    blindspots: [
      `Are you suffering from "Not Invented Here" syndrome — building in-house what commodity tools already solve?`,
      `Have you calculated the maintenance salary cost over a 3-year lifespan?`,
    ],
    gutCheckQuestions: [
      `Does this feature represent the core secret sauce that customers pay you for? If not, why build it from scratch?`,
    ],
    createdAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// Career / Job Decision Generator
// -------------------------------------------------------------
function buildCareerAnalysis(title: string, options: string[], context: string): DecisionResult {
  const optA = options[0];
  const optB = options[1];

  const criteria: Criterion[] = [
    { id: 'c_growth', name: 'Learning Velocity & Skill Compounding', weight: 9, description: 'Rate of acquiring scarce, high-value capabilities.' },
    { id: 'c_comp', name: 'Total Compensation & Financial Upside', weight: 8, description: 'Base pay, bonuses, equity value, and benefits.' },
    { id: 'c_autonomy', name: 'Autonomy, Impact & Leadership Scope', weight: 8, description: 'Direct ownership of strategic outcomes.' },
    { id: 'c_wlb', name: 'Work-Life Sustainability & Burnout Protection', weight: 8, description: 'Hours, stress, cognitive recovery, and boundaries.' },
    { id: 'c_optionality', name: 'Career Optionality in 3-5 Years', weight: 9, description: 'Doors opened for executive roles or founding ventures.' },
  ];

  const scores: Record<string, Record<string, { score: number; reason: string }>> = {};
  const prosCons: Record<string, { pros: ProConItem[]; cons: ProConItem[] }> = {};
  const swot: Record<string, OptionSWOT> = {};

  options.forEach((opt, idx) => {
    const isFirst = idx === 0;
    prosCons[opt] = {
      pros: [
        { id: `p_${idx}_1`, text: `Offers clear acceleration toward stated 5-year ambitions for ${opt}.`, weight: 5, category: 'Career', impact: 'high' },
        { id: `p_${idx}_2`, text: `Builds scarce resume credentials and expands high-leverage network.`, weight: 4, category: 'Growth', impact: 'medium' },
      ],
      cons: [
        { id: `c_${idx}_1`, text: `Demands short-term adaptation and upfront effort calibration.`, weight: 4, category: 'Effort', impact: 'medium' },
      ],
    };

    scores[opt] = {
      c_growth: { score: isFirst ? 9 : 7, reason: `Accelerated learning velocity.` },
      c_comp: { score: isFirst ? 8 : 8, reason: `Competitive market compensation package.` },
      c_autonomy: { score: isFirst ? 8 : 6, reason: `Higher direct leverage.` },
      c_wlb: { score: isFirst ? 7 : 8, reason: `Sustainable with proactive boundary setting.` },
      c_optionality: { score: isFirst ? 9 : 7, reason: `Opens higher tier future opportunities.` },
    };

    swot[opt] = {
      strengths: [`Direct impact and high ownership`, `Strong alignment with long-term ambition`],
      weaknesses: [`Adjustment friction in the initial 90 days`],
      opportunities: [`Position yourself as an indispensable domain leader`],
      threats: [`Scope creep or organizational restructuring`],
      strategies: {
        so: [`Establish high-visibility quick wins within your first 60 days.`],
        st: [`Maintain regular 1-on-1 alignment with key executive sponsors.`],
        wo: [`Set clear boundary rules early to prevent burnout.`],
        wt: [`Keep professional relationships warm across your broader network.`],
      },
      summaryVerdict: `${opt} provides superior career trajectory and skill equity compounding.`,
    };
  });

  return {
    decisionId: `dec_career_${Date.now()}`,
    title,
    context,
    options,
    summary: `Executive career evaluation comparing ${options.join(' vs ')} for "${title}". Analyzed against learning velocity, 5-year optionality, compensation upside, and burnout sustainability.`,
    recommendation: {
      winner: optA,
      confidenceScore: 84,
      verdictHeadline: `${optA} holds the decisive career trajectory advantage`,
      verdictReasoning: `Over a multi-year horizon, your career value is determined by learning velocity and the scarcity of problems you solve. ${optA} provides superior compounding skill equity and ownership, while downside risks are largely reversible with disciplined execution.`,
      tieBreakerFactor: `Asymmetry of Upside vs Reversible Downside. In 3 years, choosing ${optA} creates optionality you cannot easily reconstruct from ${optB}.`,
      actionPlan: [
        `Commit to ${optA} with a defined 90-day review checkpoint.`,
        `Establish pre-commitment guardrails to mitigate the primary identified weaknesses.`,
        `Conduct an open conversation with key stakeholders to align on expectations.`,
        `Archive notes on ${optB} as a contingency pivot plan if milestones are missed.`,
      ],
      irreversibleRiskWarning: `Ensure you don't burn bridges with alternatives; maintain warm professional relationships.`,
    },
    prosCons,
    comparisonMatrix: { criteria, scores },
    swot,
    blindspots: [
      `Are you overweighting short-term comfort over 3-to-5-year career trajectory?`,
      `Have you evaluated the caliber and mentorship of your direct peers and manager?`,
    ],
    gutCheckQuestions: [
      `Which choice will 80-year-old you be prouder of having tested?`,
    ],
    createdAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// General Strategy Generator
// -------------------------------------------------------------
function buildGeneralStrategyAnalysis(title: string, options: string[], context: string): DecisionResult {
  const optA = options[0];
  const optB = options[1];

  const criteria: Criterion[] = [
    { id: 'c_impact', name: 'Primary Objective Alignment', weight: 9, description: 'Direct contribution to resolving your core dilemma.' },
    { id: 'c_effort', name: 'Execution Effort & Cognitive Load', weight: 8, description: 'Time, energy, and stress required to implement.' },
    { id: 'c_reversibility', name: 'Reversibility & Downside Protection', weight: 8, description: 'Ease of pivoting if unexpected roadblocks emerge.' },
    { id: 'c_growth', name: 'Long-term Compounding Upside', weight: 7, description: 'Secondary positive ripple effects over time.' },
    { id: 'c_peace', name: 'Peace of Mind & Gut Alignment', weight: 8, description: 'Internal resonance and reduction of second-guessing.' },
  ];

  const scores: Record<string, Record<string, { score: number; reason: string }>> = {};
  const prosCons: Record<string, { pros: ProConItem[]; cons: ProConItem[] }> = {};
  const swot: Record<string, OptionSWOT> = {};

  options.forEach((opt, idx) => {
    const isFirst = idx === 0;
    prosCons[opt] = {
      pros: [
        { id: `p_${idx}_1`, text: `Directly advances your goal regarding: "${title.slice(0, 45)}...".`, weight: 5, category: 'Alignment', impact: 'high' },
        { id: `p_${idx}_2`, text: `Provides clear operational focus and eliminates paralysis.`, weight: 4, category: 'Life Quality', impact: 'medium' },
      ],
      cons: [
        { id: `c_${idx}_1`, text: `Involves upfront trade-offs and commitment friction.`, weight: 3, category: 'Effort', impact: 'medium' },
      ],
    };

    scores[opt] = {
      c_impact: { score: isFirst ? 9 : 7, reason: `Strong alignment with stated objective.` },
      c_effort: { score: isFirst ? 7 : 8, reason: `Manageable execution complexity.` },
      c_reversibility: { score: isFirst ? 8 : 7, reason: `Reasonable safety margin.` },
      c_growth: { score: isFirst ? 8 : 6, reason: `Positive secondary ripple effects.` },
      c_peace: { score: isFirst ? 9 : 7, reason: `Higher internal clarity and resolution.` },
    };

    swot[opt] = {
      strengths: [`Decisive momentum`, `Direct alignment with priorities`],
      weaknesses: [`Requires dedicated execution focus`],
      opportunities: [`Breaks cognitive paralysis and unlocks positive momentum`],
      threats: [`Second-guessing or scope creep`],
      strategies: {
        so: [`Take the first concrete micro-step within the next 24 hours.`],
        st: [`Establish clear guardrails to avoid over-committing.`],
        wo: [`Simplify non-essential tasks to free up focus.`],
        wt: [`Define explicit review points at 30 and 60 days.`],
      },
      summaryVerdict: `${opt} provides the clearest path forward with manageable execution risks.`,
    };
  });

  return {
    decisionId: `dec_gen_${Date.now()}`,
    title,
    context,
    options,
    summary: `Strategic decision breakdown comparing ${options.join(' vs ')} for "${title}". Analyzed across goal alignment, execution effort, reversibility, and peace of mind.`,
    recommendation: {
      winner: optA,
      confidenceScore: 82,
      verdictHeadline: `${optA} holds the decisive structural advantage`,
      verdictReasoning: `When comparing ${options.join(' vs ')}, ${optA} scores highest in overall alignment with your core objective, while maintaining high reversibility. Making a decisive commitment breaks the silent, corrosive cost of chronic hesitation.`,
      tieBreakerFactor: `Asymmetry of Action vs Stagnation. Inaction carries silent compounding opportunity costs, whereas ${optA} generates immediate momentum and data.`,
      actionPlan: [
        `Take the first tangible step on ${optA} today to lock in psychological momentum.`,
        `Set a 30-day checkpoint to review measurable progress.`,
        `Archive notes on alternatives as contingency fallbacks.`,
      ],
      irreversibleRiskWarning: `Beware of decision fatigue leading to impulsive changes before your 30-day review checkpoint.`,
    },
    prosCons,
    comparisonMatrix: { criteria, scores },
    swot,
    blindspots: [
      `Are you waiting for 100% certainty when 70% information is sufficient to act?`,
      `What is the true cost of doing nothing for another 3 months?`,
    ],
    gutCheckQuestions: [
      `If you flipped a coin right now and it forced you into ${optA}, would you feel relieved?`,
    ],
    createdAt: new Date().toISOString(),
  };
}
