const STORAGE_KEY = 'copycat-editor-api-key';

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function saveApiKey(key) {
  localStorage.setItem(STORAGE_KEY, key);
}

export function initSettings() {
  const btn = document.getElementById('settings-btn');
  const modal = document.getElementById('settings-modal');
  const input = document.getElementById('api-key-input');
  const saveBtn = document.getElementById('save-key-btn');
  const closeBtn = document.getElementById('close-modal-btn');

  // Highlight if no key set
  if (!getApiKey()) {
    btn.classList.add('highlight');
  }

  btn.addEventListener('click', () => {
    input.value = getApiKey();
    modal.classList.remove('hidden');
  });

  saveBtn.addEventListener('click', () => {
    saveApiKey(input.value.trim());
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
