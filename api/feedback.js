import { Resend } from 'resend';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { rating, comment, inputCode, steps } = req.body;

  if (!rating) {
    return res.status(400).json({ error: 'rating は必須です' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const feedbackTo = process.env.FEEDBACK_EMAIL;

  if (!resendKey || !feedbackTo) {
    console.warn('RESEND_API_KEY or FEEDBACK_EMAIL not set');
    return res.status(500).json({ error: '環境変数が設定されていません' });
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
}
