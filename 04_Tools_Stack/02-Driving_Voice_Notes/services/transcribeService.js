const fetch = require('node-fetch');
const FormData = require('form-data');

async function transcribe(audioBuffer, mimeType) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set — USE_WHISPER requires an OpenAI key');
  }

  const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'mp4' : 'webm';

  const form = new FormData();
  form.append('file', audioBuffer, { filename: `audio.${ext}`, contentType: mimeType });
  form.append('model', 'whisper-1');
  form.append('language', 'en');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, ...form.getHeaders() },
    body: form,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Whisper API error: ${err}`);
  }

  const data = await response.json();
  return data.text;
}

module.exports = { transcribe };
