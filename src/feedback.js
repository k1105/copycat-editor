const modal = document.getElementById('feedback-modal');
const starsContainer = document.getElementById('star-rating');
const stars = starsContainer.querySelectorAll('.star');
const sendBtn = document.getElementById('send-feedback-btn');
const skipBtn = document.getElementById('skip-feedback-btn');
const feedbackText = document.getElementById('feedback-text');

let selectedRating = 0;
let feedbackData = { inputCode: '', steps: [] };

// Star rating
stars.forEach((star) => {
  star.addEventListener('click', () => {
    selectedRating = Number(star.dataset.value);
    stars.forEach((s) => {
      s.classList.toggle('active', Number(s.dataset.value) <= selectedRating);
    });
    sendBtn.disabled = false;
  });
});

function reset() {
  selectedRating = 0;
  feedbackText.value = '';
  sendBtn.disabled = true;
  sendBtn.textContent = '送信';
  stars.forEach((s) => s.classList.remove('active'));
}

export function showFeedback(inputCode, steps) {
  feedbackData = { inputCode, steps };
  reset();
  modal.classList.remove('hidden');
}

function close() {
  modal.classList.add('hidden');
}

skipBtn.addEventListener('click', close);

// Close on backdrop click
modal.addEventListener('click', (e) => {
  if (e.target === modal) close();
});

sendBtn.addEventListener('click', async () => {
  sendBtn.disabled = true;
  sendBtn.textContent = '送信中...';

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: selectedRating,
        comment: feedbackText.value.trim(),
        inputCode: feedbackData.inputCode,
        steps: feedbackData.steps,
      }),
    });

    if (!res.ok) throw new Error('送信に失敗しました');

    sendBtn.textContent = '送信しました！';
    setTimeout(close, 1000);
  } catch (err) {
    console.error(err);
    sendBtn.textContent = '送信失敗 - 再試行';
    sendBtn.disabled = false;
  }
});
