import express from 'express';
import { createServer as createViteServer } from 'vite';
import analyzeHandler from './api/analyze.js';
import feedbackHandler from './api/feedback.js';

async function start() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // API endpoints (same handlers as Vercel serverless functions)
  app.post('/api/analyze', analyzeHandler);
  app.post('/api/feedback', feedbackHandler);

  // Vite dev server as middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
  });
  app.use(vite.middlewares);

  const port = 5173;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

start();
