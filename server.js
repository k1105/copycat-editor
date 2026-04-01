import express from 'express';
import { createServer as createViteServer } from 'vite';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { Resend } from 'resend';

const SYSTEM_PROMPT = `あなたはコード教育の専門家です。以下のコードを、初学者が段階的に写経できるようにステップに分解してください。

ルール：
- 基盤から積み上げる方式。最小限の動くコードをStep 1とし、徐々に機能を追加する
- 各ステップは前のステップのコードを含む（差分が明確になるように）
- 各ステップに短い解説文をつける：「このステップでは...を追加します。これは...という役割です。」
- 可読性の低い変数名にはコメントで意味を付記する（例: t = 0.1 // t = time）
- 各ステップが単体で実行可能であること（p5.js、Three.js、生WebGLいずれの場合も）
- Three.jsのコードの場合、THREE名前空間を使用する（importではなくCDNで読み込まれる前提）
- 生WebGLのコードの場合、id="canvas"のcanvas要素が存在する前提で書く

以下のJSON形式で返答してください（JSONのみ、他のテキストは不要）：
{
  "steps": [
    {
      "code": "// ステップ1のコード全体",
      "explanation": "解説文"
    }
  ]
}`;

const PROVIDERS = {
  anthropic: (apiKey, model) => {
    const provider = createAnthropic({ apiKey });
    return provider(model);
  },
  gemini: (apiKey, model) => {
    const provider = createGoogleGenerativeAI({ apiKey });
    return provider(model);
  },
  openai: (apiKey, model) => {
    const provider = createOpenAI({ apiKey });
    return provider(model);
  },
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function start() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // API endpoint
  app.post('/api/analyze', async (req, res) => {
    const { code, apiKey, provider, model } = req.body;

    if (!code || !apiKey || !provider || !model) {
      return res.status(400).json({ error: 'code, apiKey, provider, model は必須です' });
    }

    const createModel = PROVIDERS[provider];
    if (!createModel) {
      return res.status(400).json({ error: `未対応のプロバイダー: ${provider}` });
    }

    try {
      const { text } = await generateText({
        model: createModel(apiKey, model),
        system: SYSTEM_PROMPT,
        prompt: `以下のコードをステップに分解してください：\n\n\`\`\`\n${code}\n\`\`\``,
        maxTokens: 8192,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return res.status(500).json({ error: 'APIレスポンスからJSONを抽出できませんでした' });
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.steps || !Array.isArray(parsed.steps)) {
        return res.status(500).json({ error: '無効なレスポンス形式です' });
      }

      res.json(parsed);
    } catch (err) {
      console.error('Analysis error:', err.message);
      res.status(502).json({ error: err.message });
    }
  });

  // Feedback endpoint
  app.post('/api/feedback', async (req, res) => {
    const { rating, comment, inputCode, steps } = req.body;

    if (!rating) {
      return res.status(400).json({ error: 'rating は必須です' });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const feedbackTo = process.env.FEEDBACK_EMAIL;

    if (!resendKey || !feedbackTo) {
      console.warn('RESEND_API_KEY or FEEDBACK_EMAIL not set, logging feedback only');
      console.log('Feedback:', { rating, comment, stepsCount: steps?.length });
      return res.json({ ok: true });
    }

    const resend = new Resend(resendKey);

    const stepsHtml = (steps || [])
      .map(
        (s, i) =>
          `<h3>Step ${i + 1}</h3><p>${s.explanation}</p><pre style="background:#f4f4f4;padding:8px;overflow-x:auto;font-size:12px;">${escapeHtml(s.code)}</pre>`
      )
      .join('');

    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    try {
      await resend.emails.send({
        from: 'Copycat Editor <onboarding@resend.dev>',
        to: feedbackTo,
        subject: `[Copycat Feedback] ${stars}`,
        html: `
          <h2>フィードバック</h2>
          <p><strong>評価:</strong> ${stars} (${rating}/5)</p>
          <p><strong>コメント:</strong> ${comment || '(なし)'}</p>
          <hr/>
          <h2>入力コード</h2>
          <pre style="background:#f4f4f4;padding:8px;overflow-x:auto;font-size:12px;">${escapeHtml(inputCode || '')}</pre>
          <hr/>
          <h2>生成されたステップ (${steps?.length || 0})</h2>
          ${stepsHtml}
        `,
      });

      res.json({ ok: true });
    } catch (err) {
      console.error('Resend error:', err.message);
      res.status(502).json({ error: 'メール送信に失敗しました' });
    }
  });

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
