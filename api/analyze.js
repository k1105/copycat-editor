import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

const SYSTEM_PROMPT = `あなたはコード教育の専門家です。以下のコードを、初学者が段階的に写経できるようにステップに分解してください。

ルール：
- 基盤から積み上げる方式。最小限の動くコードをStep 1とし、徐々に機能を追加する
- 各ステップは前のステップのコードを含む（差分が明確になるように）
- 各ステップに短い解説文をつける：「このステップでは...を追加します。これは...という役割です。」
- 可読性の低い変数名にはコメントで意味を付記する（例: t = 0.1 // t = time）
- 各ステップが単体で実行可能であること（p5.js、Three.js、生WebGLいずれの場合も）
- Three.jsのコードの場合、THREE名前空間を使用する（importではなくCDNで読み込まれる前提）
- 生WebGLのコードの場合、id="canvas"のcanvas要素が存在する前提で書く

解説の質について：
- 数学的な処理（三角関数、行列演算、フラクタル、ノイズ等）には、その原理・目的を平易に解説すること。数式をそのまま書くのではなく「何をしているか」「なぜそうするか」を説明する
- 有名なアルゴリズムやテクニック（例: Perlinノイズ、レイマーチング、SDF、コサインパレット等）が使われている場合、名前を明記し、その概要を1〜2文で説明する
- コードが複数の独立した概念を組み合わせている場合、解説文の中で各パーツを区別して説明する（例:「このステップでは2つの要素を追加します。(1) fold関数：放射状の対称性を作る座標変換です。(2) getRainbow関数：コサインパレットと呼ばれる手法で…」）

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    console.error('Analysis error:', err);
    const message = err.data?.error?.message || err.message || 'Unknown error';
    res.status(502).json({ error: message });
  }
}
