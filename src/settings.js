const ANTHROPIC_KEY = 'copycat-editor-api-key';
const GEMINI_KEY = 'copycat-editor-gemini-key';
const OPENAI_KEY = 'copycat-editor-openai-key';
const PROVIDER_KEY = 'copycat-editor-provider';
const MODEL_KEY = 'copycat-editor-model';

const KEY_MAP = {
  anthropic: ANTHROPIC_KEY,
  gemini: GEMINI_KEY,
  openai: OPENAI_KEY,
};

const MODEL_OPTIONS = {
  anthropic: [
    { value: 'claude-sonnet-4-0-20250514', label: 'Claude Sonnet 4' },
    { value: 'claude-opus-4-0-20250514', label: 'Claude Opus 4' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
  ],
  gemini: [
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  ],
  openai: [
    { value: 'gpt-4.1', label: 'GPT-4.1' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
    { value: 'o3', label: 'o3' },
    { value: 'o4-mini', label: 'o4-mini' },
  ],
};

export function getProvider() {
  return localStorage.getItem(PROVIDER_KEY) || 'anthropic';
}

export function getModel() {
  const saved = localStorage.getItem(MODEL_KEY);
  const provider = getProvider();
  // 保存されたモデルが現在のプロバイダーに属していなければデフォルトを返す
  const options = MODEL_OPTIONS[provider];
  if (saved && options.some((o) => o.value === saved)) return saved;
  return options[0].value;
}

export function getApiKey() {
  return localStorage.getItem(KEY_MAP[getProvider()]) || '';
}

function hasAnyKey() {
  return Object.values(KEY_MAP).some((k) => localStorage.getItem(k));
}

export function initSettings() {
  const btn = document.getElementById('settings-btn');
  const modal = document.getElementById('settings-modal');
  const providerSelect = document.getElementById('provider-select');
  const modelSelect = document.getElementById('model-select');
  const inputs = {
    anthropic: document.getElementById('api-key-input'),
    gemini: document.getElementById('gemini-key-input'),
    openai: document.getElementById('openai-key-input'),
  };
  const groups = {
    anthropic: document.getElementById('anthropic-key-group'),
    gemini: document.getElementById('gemini-key-group'),
    openai: document.getElementById('openai-key-group'),
  };
  const saveBtn = document.getElementById('save-key-btn');
  const closeBtn = document.getElementById('close-modal-btn');

  if (!hasAnyKey()) {
    btn.classList.add('highlight');
  }

  function populateModels(provider) {
    modelSelect.innerHTML = '';
    for (const opt of MODEL_OPTIONS[provider]) {
      const el = document.createElement('option');
      el.value = opt.value;
      el.textContent = opt.label;
      modelSelect.appendChild(el);
    }
  }

  function updateKeyVisibility() {
    const provider = providerSelect.value;
    for (const [key, group] of Object.entries(groups)) {
      group.classList.toggle('hidden', key !== provider);
    }
    populateModels(provider);
    // 保存済みモデルがあればセット
    const saved = localStorage.getItem(MODEL_KEY);
    if (saved && MODEL_OPTIONS[provider].some((o) => o.value === saved)) {
      modelSelect.value = saved;
    }
  }

  providerSelect.addEventListener('change', updateKeyVisibility);

  btn.addEventListener('click', () => {
    providerSelect.value = getProvider();
    for (const [key, input] of Object.entries(inputs)) {
      input.value = localStorage.getItem(KEY_MAP[key]) || '';
    }
    updateKeyVisibility();
    modal.classList.remove('hidden');
  });

  saveBtn.addEventListener('click', () => {
    localStorage.setItem(PROVIDER_KEY, providerSelect.value);
    localStorage.setItem(MODEL_KEY, modelSelect.value);
    for (const [key, input] of Object.entries(inputs)) {
      localStorage.setItem(KEY_MAP[key], input.value.trim());
    }
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
