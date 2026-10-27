import { DecisionResult, AIProvider } from '../types/decision';
import { generateDomainSpecificAnalysis, detectDomain } from './domainAnalyzer';

/**
 * Intelligent client-side decision engine.
 * Runs directly in the browser when deployed on static hosts like GitHub Pages
 * where a Node/Express backend is not present.
 */
export function generateLocalDecisionAnalysis(
  title: string,
  options: string[],
  context: string = '',
  provider: AIProvider = 'claude'
): DecisionResult {
  return generateDomainSpecificAnalysis(title, options, context, provider);
}

export function generateLocalChatResponse(
  question: string,
  decisionTitle: string,
  options: string[],
  recommendation?: { winner: string }
): string {
  const domain = detectDomain(decisionTitle, options);
  const winner = recommendation?.winner || options[0] || 'your lead option';

  if (domain === 'OPTIONS_TRADING') {
    return `Regarding your options question "${question}" on "${decisionTitle}":

1. **Theta & Gamma Sensitivity:** In the final sessions leading to expiration, extrinsic value decay is non-linear. If you hold, ensure you aren't fighting negative theta without an immediate confirmed catalyst.

2. **Execution Strategy:** If choosing ${winner}, set a disciplined limit order or trailing stop. For options, taking guaranteed realized profits is the single highest-probability edge over time.`;
  }

  if (domain === 'STOCK_INVESTING') {
    return `Regarding "${question}" on your portfolio decision "${decisionTitle}":

1. **Risk Management:** Focus on position sizing. Never allocate more than your risk tolerance allows for a single trade.
2. **Horizon Alignment:** If choosing ${winner}, stick to your predetermined exit criteria rather than reacting to short-term market noise.`;
  }

  return `Regarding your question "${question}" on "${decisionTitle}":

1. **Reversibility Check:** In Jeff Bezos's framework, decisions are Type 1 (irreversible one-way doors) or Type 2 (reversible two-way doors). Choosing ${winner} is largely a Type 2 decision if you predetermine your exit or pivot conditions.

2. **The Regret Minimization Test:** Project forward across your time horizon. The pain of short-term friction fades rapidly, but the regret of untested potential lingers indefinitely. Focus your energy on mitigating downside risk rather than avoiding the leap.`;
}
