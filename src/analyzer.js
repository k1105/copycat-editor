export async function analyzeCode(code, apiKey, provider = 'anthropic') {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, apiKey, provider }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API Error (${response.status})`);
  }

  return data.steps;
}
