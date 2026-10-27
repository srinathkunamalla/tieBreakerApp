import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { DecisionResult } from './src/types/decision.js';
import { generateDomainSpecificAnalysis } from './src/utils/domainAnalyzer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function generateDeterministicFallback(
  title: string,
  options: string[],
  context: string = ''
): DecisionResult {
  return generateDomainSpecificAnalysis(title, options, context);
}

// POST: Analyze Decision
app.post('/api/analyze-decision', async (req: Request, res: Response) => {
  try {
    const { title, options, context, mode } = req.body;

    if (!title || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Title and at least 2 options are required.' });
    }

    if (!ai) {
      console.warn('GEMINI_API_KEY is not configured. Serving high-fidelity deterministic evaluation.');
      const fallback = generateDeterministicFallback(title, options, context);
      return res.json(fallback);
    }

    const prompt = `You are "The Tie Breaker", an elite decision-making strategist and domain expert.
Analyze this high-stakes decision with deep, authentic domain expertise and technical rigor.

DECISION TO MAKE: "${title}"
OPTIONS TO COMPARE: ${JSON.stringify(options)}
ADDITIONAL CONTEXT & USER PREFERENCES: "${context || 'None provided'}"
REQUESTED FOCUS MODE: "${mode || 'all'}"

CRITICAL DOMAIN DIRECTIVE:
Identify the exact domain of the dilemma (e.g. Options/Derivatives Trading, Stock Investing, Real Estate, Tech Architecture, Career, Personal).
You MUST evaluate the dilemma using deep, authentic domain terminology and realistic mechanics:
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
    "confidenceScore": 85, // number 0-100
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
          "weight": 5, // 1 to 5 integer
          "category": "Career" | "Financial" | "Life Quality" | "Risk" | "Growth" | "Effort" | "Alignment" | "General",
          "impact": "high" | "medium" | "low"
        }
      ],
      "cons": [
        {
          "id": "c1",
          "text": "Specific con or hidden cost",
          "weight": 4, // 1 to 5 integer
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
        "name": "Criterion name (e.g. Financial Return, Work-Life Balance, Growth Ceiling)",
        "weight": 8, // 1 to 10
        "description": "Brief description of why this matters for this decision"
      }
    ],
    "scores": {
      "<OptionName>": {
        "c1": {
          "score": 9, // 1 to 10
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

Ensure all options provided in the input have corresponding entries in prosCons, comparisonMatrix.scores, and swot. Give realistic weights and scores that reflect genuine differences between the options. Do not make all scores identical.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini');
    }

    const parsed = JSON.parse(text);
    const result: DecisionResult = {
      decisionId: `dec_${Date.now()}`,
      title,
      context,
      options,
      summary: parsed.summary || `Evaluation of ${options.join(' vs ')}`,
      recommendation: parsed.recommendation || {
        winner: options[0],
        confidenceScore: 75,
        verdictHeadline: `${options[0]} emerges as the front-runner`,
        verdictReasoning: `Balanced analysis shows ${options[0]} satisfies more key criteria.`,
        tieBreakerFactor: `Stronger alignment with core goals.`,
        actionPlan: [`Initiate next steps on ${options[0]}.`],
      },
      prosCons: parsed.prosCons || {},
      comparisonMatrix: parsed.comparisonMatrix || { criteria: [], scores: {} },
      swot: parsed.swot || {},
      blindspots: parsed.blindspots || [],
      gutCheckQuestions: parsed.gutCheckQuestions || [],
      createdAt: new Date().toISOString(),
    };

    return res.json(result);
  } catch (error: any) {
    console.error('Error analyzing decision with Gemini:', error);
    // Graceful fallback so the user always receives an actionable analysis
    const { title, options, context } = req.body;
    const fallback = generateDeterministicFallback(title || 'Decision', options || ['Option A', 'Option B'], context);
    return res.json(fallback);
  }
});

// POST: Devil's Advocate / Follow-up Clarification
app.post('/api/chat-clarify', async (req: Request, res: Response) => {
  try {
    const { question, decisionTitle, options, recommendation } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    if (!ai) {
      return res.json({
        answer: `As The Tie Breaker, considering your question "${question}" regarding "${decisionTitle}": When testing scenarios like this, evaluate whether the risk is reversible (Type 2 decision) or irreversible (Type 1 decision). For ${recommendation?.winner || options?.[0] || 'your lead option'}, focus on setting a firm 60-day check-in threshold to ensure you maintain complete agility.`,
      });
    }

    const prompt = `You are "The Tie Breaker", a sharp, wise, and pragmatic decision strategist.
The user is evaluating the decision: "${decisionTitle}".
Options: ${JSON.stringify(options)}.
Current Recommendation: ${JSON.stringify(recommendation)}.

The user asks: "${question}".

Answer concisely (2 to 3 paragraphs max), delivering decisive, actionable, and non-generic insight. Highlight risks, cognitive traps, or clarifying mental models (e.g., Regret Minimization, Inversion, Expected Value, or 10-10-10 rule).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ answer: response.text || 'No response generated.' });
  } catch (error: any) {
    console.error('Error in chat clarify:', error);
    return res.json({
      answer: `Evaluating "${req.body.question}" in the context of "${req.body.decisionTitle}": prioritize whichever path preserves the highest degree of optionality while minimizing unhedged downside.`,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`The Tie Breaker server is running on http://localhost:${PORT}`);
  });
}

startServer();
