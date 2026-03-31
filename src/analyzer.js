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

export async function analyzeCode(code, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `以下のコードをステップに分解してください：\n\n\`\`\`\n${code}\n\`\`\``,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  // Extract JSON from response (handle possible markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('APIレスポンスからJSONを抽出できませんでした');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.steps || !Array.isArray(parsed.steps)) {
    throw new Error('無効なレスポンス形式です');
  }

  return parsed.steps;
}
