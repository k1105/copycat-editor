const ANTHROPIC_KEY = 'copycat-editor-api-key';
const GEMINI_KEY = 'copycat-editor-gemini-key';
const PROVIDER_KEY = 'copycat-editor-provider';

export function getProvider() {
  return localStorage.getItem(PROVIDER_KEY) || 'anthropic';
}

export function getApiKey() {
  const provider = getProvider();
  if (provider === 'gemini') {
    return localStorage.getItem(GEMINI_KEY) || '';
  }
  return localStorage.getItem(ANTHROPIC_KEY) || '';
}

function hasAnyKey() {
  return localStorage.getItem(ANTHROPIC_KEY) || localStorage.getItem(GEMINI_KEY);
}

export function initSettings() {
  const btn = document.getElementById('settings-btn');
  const modal = document.getElementById('settings-modal');
  const providerSelect = document.getElementById('provider-select');
  const anthropicInput = document.getElementById('api-key-input');
  const geminiInput = document.getElementById('gemini-key-input');
  const anthropicGroup = document.getElementById('anthropic-key-group');
  const geminiGroup = document.getElementById('gemini-key-group');
  const saveBtn = document.getElementById('save-key-btn');
  const closeBtn = document.getElementById('close-modal-btn');

  if (!hasAnyKey()) {
    btn.classList.add('highlight');
  }

  function updateKeyVisibility() {
    const provider = providerSelect.value;
    anthropicGroup.classList.toggle('hidden', provider !== 'anthropic');
    geminiGroup.classList.toggle('hidden', provider !== 'gemini');
  }

  providerSelect.addEventListener('change', updateKeyVisibility);

  btn.addEventListener('click', () => {
    providerSelect.value = getProvider();
    anthropicInput.value = localStorage.getItem(ANTHROPIC_KEY) || '';
    geminiInput.value = localStorage.getItem(GEMINI_KEY) || '';
    updateKeyVisibility();
    modal.classList.remove('hidden');
  });

  saveBtn.addEventListener('click', () => {
    localStorage.setItem(PROVIDER_KEY, providerSelect.value);
    localStorage.setItem(ANTHROPIC_KEY, anthropicInput.value.trim());
    localStorage.setItem(GEMINI_KEY, geminiInput.value.trim());
    btn.classList.remove('highlight');
    modal.classList.add('hidden');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
}
