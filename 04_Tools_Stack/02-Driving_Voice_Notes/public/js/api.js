async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const api = {
  processTranscription: (transcription) =>
    apiFetch('/api/notes/process', {
      method: 'POST',
      body: JSON.stringify({ transcription }),
    }),

  getToday: () => apiFetch('/api/notes/today'),

  uploadAudio: (blob) => {
    const form = new FormData();
    form.append('audio', blob, 'recording.webm');
    return fetch('/api/voice/upload', { method: 'POST', body: form }).then((r) => r.json());
  },
};
