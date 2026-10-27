import { GoogleGenAI } from '@google/genai';
import { DecisionResult, AIProvider } from '../types/decision.js';
import { generateDomainSpecificAnalysis } from '../utils/domainAnalyzer.js';

interface AnalyzeRequest {
  title: string;
  options: string[];
  context?: string;
  mode?: string;
  provider?: AIProvider;
}

const SYSTEM_PROMPT = `You are "The Tie Breaker", an elite decision-making strategist, risk analyst, and domain expert.
Analyze the user's high-stakes dilemma with extreme domain precision, quantitative rigor, and cognitive clarity.

CRITICAL DOMAIN DIRECTIVE:
Identify the exact domain of the decision (e.g. Options/Derivatives Trading, Stock Investing, Real Estate, Tech Architecture, Career, Personal Life):
- If the decision involves OPTIONS TRADING (e.g. "CVS 96C 10/30 Sell or Hold"): Analyze Theta decay (exponential time decay into expiration), Implied Volatility (IV) crush, Delta leverage, strike price vs underlying spot price, risk of expiring worthless ($0.00), capital preservation, and rolling out strategies. DO NOT give generic corporate or career advice!
- If the decision is FINANCIAL or INVESTING: Analyze risk-adjusted return, capital preservation, liquidity, drawdowns, and Sharpe ratio.
- If the decision is REAL ESTATE: Analyze monthly cash flow, unrecoverable costs (property tax, interest, HOA), and time horizon.
- If the decision is TECH/SOFTWARE: Analyze engineering velocity, technical debt, total cost of ownership, and vendor lock-in.

Provide a thorough, mathematically weighted, and deeply nuanced breakdown.
Return strict JSON matching this exact structure:
{
  "summary": "2-3 sentence executive summary of the dilemma and core trade-offs",
  "recommendation": {
    "winner": "Exact string of the winning option (or 'Tie' if virtually identical)",
    "confidenceScore": 85,
    "verdictHeadline": "Punchy 1-line verdict summary",
    "verdictReasoning": "Deep 2-3 paragraph explanation of why this option is superior, trade-offs made, and why the losing options fall short",
    "tieBreakerFactor": "The single decisive differentiator or asymmetric pivot point that tips the scale",
    "actionPlan": ["Next step 1", "Next step 2", "Next step 3", "Next step 4"],
    "irreversibleRiskWarning": "Specific risk to guard against or contingency trigger"
  },
  "prosCons": {
    "<OptionName>": {
      "pros": [
        {
          "id": "p1",
          "text": "Specific pro statement with clear rationale",
          "weight": 5,
          "category": "Career" | "Financial" | "Life Quality" | "Risk" | "Growth" | "Effort" | "Alignment" | "General",
          "impact": "high" | "medium" | "low"
        }
      ],
      "cons": [
        {
          "id": "c1",
          "text": "Specific con or hidden cost",
          "weight": 4,
          "category": "Career" | "Financial" | "Life Quality" | "Risk" | "Growth" | "Effort" | "Alignment" | "General",
          "impact": "high" | "medium" | "low"
        }
      ]
    }
  },
  "comparisonMatrix": {
    "criteria": [
      {
        "id": "c1",
        "name": "Criterion name",
        "weight": 8,
        "description": "Brief description of why this matters for this decision"
      }
    ],
    "scores": {
      "<OptionName>": {
        "c1": {
          "score": 9,
          "reason": "Clear justification"
        }
      }
    }
  },
  "swot": {
    "<OptionName>": {
      "strengths": ["Item 1", "Item 2", "Item 3"],
      "weaknesses": ["Item 1", "Item 2"],
      "opportunities": ["Item 1", "Item 2", "Item 3"],
      "threats": ["Item 1", "Item 2"],
      "strategies": {
        "so": ["Strength-Opportunity strategic move"],
        "st": ["Strength-Threat defensive move"],
        "wo": ["Weakness-Opportunity mitigation"],
        "wt": ["Weakness-Threat contingency"]
      },
      "summaryVerdict": "1 sentence takeaway for this option"
    }
  },
  "blindspots": [
    "Cognitive bias or unasked question 1",
    "Cognitive bias or unasked question 2",
    "Cognitive bias or unasked question 3"
  ],
  "gutCheckQuestions": [
    "Intuition probe question 1",
    "Intuition probe question 2",
    "Intuition probe question 3"
  ]
}

Ensure all options provided in the input have corresponding entries in prosCons, comparisonMatrix.scores, and swot. Give realistic weights and scores that reflect genuine differences between the options.`;

/**
 * Call Anthropic Claude 3.5 Sonnet
 */
async function callClaude(apiKey: string, prompt: string): Promise<any> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Claude');
  const cleanJson = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  return JSON.parse(cleanJson);
}

/**
 * Call OpenAI GPT-4o
 */
async function callOpenAI(apiKey: string, prompt: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

/**
 * Call xAI Grok-2
 */
async function callGrok(apiKey: string, prompt: string): Promise<any> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-2-latest',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Grok API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

/**
 * Call Google Gemini
 */
async function callGemini(apiKey: string, prompt: string): Promise<any> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${SYSTEM_PROMPT}\n\n${prompt}`,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text);
}

/**
 * Main dispatcher supporting Claude, OpenAI, Grok, and Gemini
 */
export async function analyzeDecisionWithMultiModel(req: AnalyzeRequest): Promise<DecisionResult> {
  const { title, options, context, mode, provider = 'claude' } = req;

  const userPrompt = `DECISION TO MAKE: "${title}"
OPTIONS TO COMPARE: ${JSON.stringify(options)}
ADDITIONAL CONTEXT & PREFERENCES: "${context || 'None provided'}"
REQUESTED FOCUS MODE: "${mode || 'all'}"`;

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const grokKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  let parsed: any = null;
  let activeProviderName = '';

  // 1. Try requested provider first if API key is present
  try {
    if (provider === 'claude' && anthropicKey) {
      parsed = await callClaude(anthropicKey, userPrompt);
      activeProviderName = 'Claude 3.5 Sonnet';
    } else if (provider === 'openai' && openaiKey) {
      parsed = await callOpenAI(openaiKey, userPrompt);
      activeProviderName = 'GPT-4o';
    } else if (provider === 'grok' && grokKey) {
      parsed = await callGrok(grokKey, userPrompt);
      activeProviderName = 'Grok-2';
    } else if (provider === 'gemini' && geminiKey) {
      parsed = await callGemini(geminiKey, userPrompt);
      activeProviderName = 'Gemini 2.5 Flash';
    }
  } catch (err) {
    console.warn(`Primary provider ${provider} call failed:`, err);
  }

  // 2. Fallback to any other configured AI provider if available
  if (!parsed) {
    if (anthropicKey && provider !== 'claude') {
      try {
        parsed = await callClaude(anthropicKey, userPrompt);
        activeProviderName = 'Claude 3.5 Sonnet (Auto-Routed)';
      } catch (e) {
        console.warn('Claude fallback failed:', e);
      }
    } else if (openaiKey && provider !== 'openai') {
      try {
        parsed = await callOpenAI(openaiKey, userPrompt);
        activeProviderName = 'GPT-4o (Auto-Routed)';
      } catch (e) {
        console.warn('OpenAI fallback failed:', e);
      }
    } else if (grokKey && provider !== 'grok') {
      try {
        parsed = await callGrok(grokKey, userPrompt);
        activeProviderName = 'Grok-2 (Auto-Routed)';
      } catch (e) {
        console.warn('Grok fallback failed:', e);
      }
    } else if (geminiKey && provider !== 'gemini') {
      try {
        parsed = await callGemini(geminiKey, userPrompt);
        activeProviderName = 'Gemini 2.5 Flash (Auto-Routed)';
      } catch (e) {
        console.warn('Gemini fallback failed:', e);
      }
    }
  }

  // 3. If external live models are unconfigured, run the high-fidelity domain strategy engine
  if (!parsed) {
    const modelLabels: Record<AIProvider, string> = {
      claude: 'Claude 3.5 Sonnet',
      openai: 'GPT-4o',
      grok: 'Grok-2',
      gemini: 'Gemini 2.5 Flash',
    };
    return generateDomainSpecificAnalysis(title, options, context || '', provider);
  }

  return {
    decisionId: `dec_${Date.now()}`,
    title,
    context,
    options,
    summary: parsed.summary || `Evaluation of ${options.join(' vs ')}`,
    recommendation: parsed.recommendation || {
      winner: options[0],
      confidenceScore: 82,
      verdictHeadline: `${options[0]} holds the structural advantage`,
      verdictReasoning: `Structured evaluation shows ${options[0]} satisfies more key criteria.`,
      tieBreakerFactor: `Stronger alignment with core strategic goals.`,
      actionPlan: [`Initiate next steps on ${options[0]}.`],
    },
    prosCons: parsed.prosCons || {},
    comparisonMatrix: parsed.comparisonMatrix || { criteria: [], scores: {} },
    swot: parsed.swot || {},
    blindspots: parsed.blindspots || [],
    gutCheckQuestions: parsed.gutCheckQuestions || [],
    aiProvider: provider,
    modelName: activeProviderName,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Handle follow-up Devil's Advocate chat with multi-model capability
 */
export async function clarifyChatWithMultiModel(params: {
  question: string;
  decisionTitle: string;
  options: string[];
  recommendation?: any;
  provider?: AIProvider;
}): Promise<string> {
  const { question, decisionTitle, options, recommendation, provider = 'claude' } = params;

  const prompt = `The user is evaluating the decision: "${decisionTitle}".
Options: ${JSON.stringify(options)}.
Current Recommendation: ${JSON.stringify(recommendation)}.
The user asks: "${question}".

Deliver a concise (2 to 3 paragraphs max), mathematically and practically sound answer. Avoid generic advice.`;

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const grokKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (provider === 'claude' && anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const d = await res.json();
        return d.content?.[0]?.text || '';
      }
    } catch (e) {
      console.warn('Claude chat error:', e);
    }
  }

  if (provider === 'openai' && openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const d = await res.json();
        return d.choices?.[0]?.message?.content || '';
      }
    } catch (e) {
      console.warn('OpenAI chat error:', e);
    }
  }

  if (provider === 'grok' && grokKey) {
    try {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${grokKey}`,
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const d = await res.json();
        return d.choices?.[0]?.message?.content || '';
      }
    } catch (e) {
      console.warn('Grok chat error:', e);
    }
  }

  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      if (resp.text) return resp.text;
    } catch (e) {
      console.warn('Gemini chat error:', e);
    }
  }

  // Fallback
  return `Regarding "${question}" on "${decisionTitle}":
When stress-testing ${recommendation?.winner || options[0]}, focus on the math of the downside. If you are dealing with options, remember that time decay (Theta) is exponential. If holding, enforce a strict exit stop rather than gambling on a miracle rebound.`;
}
