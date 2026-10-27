import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeDecisionWithMultiModel, clarifyChatWithMultiModel, askAnythingWithMultiModel } from './src/server/aiRouter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Runtime Environment constraint: Dev server must strictly run on port 3000
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// POST: Analyze Decision with multi-model capability (Claude, OpenAI, Grok, Gemini)
app.post('/api/analyze-decision', async (req: Request, res: Response) => {
  try {
    const { title, options, context, mode, provider } = req.body;

    if (!title || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Title and at least 2 options are required.' });
    }

    const result = await analyzeDecisionWithMultiModel({
      title,
      options,
      context,
      mode,
      provider: provider || 'claude',
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error analyzing decision:', error);
    return res.status(500).json({ error: 'Failed to evaluate decision.' });
  }
});

// POST: Devil's Advocate / Follow-up Clarification
app.post('/api/chat-clarify', async (req: Request, res: Response) => {
  try {
    const { question, decisionTitle, options, recommendation, provider } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const answer = await clarifyChatWithMultiModel({
      question,
      decisionTitle: decisionTitle || 'Decision',
      options: options || [],
      recommendation,
      provider: provider || 'claude',
    });

    return res.json({ answer });
  } catch (error: any) {
    console.error('Error in chat clarify:', error);
    return res.json({
      answer: `Prioritize whichever path preserves the highest degree of optionality while minimizing unhedged downside.`,
    });
  }
});

// POST: Ask Me Anything with ChatGPT / Claude / Multi-Model AI
app.post('/api/ask-anything', async (req: Request, res: Response) => {
  try {
    const { question, context, provider } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const solution = await askAnythingWithMultiModel({
      question,
      context,
      provider: provider || 'openai',
    });

    return res.json(solution);
  } catch (error: any) {
    console.error('Error in ask-anything handler:', error);
    return res.status(500).json({ error: 'Failed to process question.' });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tie Breaker server is running on http://localhost:${PORT}`);
  });
}

startServer();
