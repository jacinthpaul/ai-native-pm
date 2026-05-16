// State
const WAKE_WORD = 'hello jack';
const STOP_WORDS = ['done', 'end note', 'stop recording', 'that\'s it', 'finish'];
const SILENCE_TIMEOUT_MS = 5000;

let state = {
  mode: 'idle', // idle | listening | capturing | processing
  capturedText: '',
  todayCount: 0,
  recognition: null,
  silenceTimer: null,
  wakeLock: null,
};

// ── DOM refs ────────────────────────────────────────────────────────────────
const modeLabel    = document.getElementById('mode-label');
const micBtn       = document.getElementById('mic-btn');
const micIcon      = document.getElementById('mic-icon');
const timerEl      = document.getElementById('timer');
const liveText     = document.getElementById('live-text');
const countEl      = document.getElementById('today-count');
const toast        = document.getElementById('toast');
const notionLink   = document.getElementById('notion-link');

// ── Wake lock (keeps screen on while app is open) ────────────────────────────
async function acquireWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      state.wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (_) {}
}

// ── Audio feedback ───────────────────────────────────────────────────────────
function beep(frequency = 880, duration = 150) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (_) {}
}

// ── Timer ────────────────────────────────────────────────────────────────────
let timerStart = null;
let timerInterval = null;

function startTimer() {
  timerStart = Date.now();
  timerEl.style.display = 'block';
  timerInterval = setInterval(() => {
    const s = Math.floor((Date.now() - timerStart) / 1000);
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${sec}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerEl.style.display = 'none';
  timerEl.textContent = '00:00';
}

// ── Toast ────────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, isError = false) {
  toast.textContent = msg;
  toast.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── Today's count ────────────────────────────────────────────────────────────
async function refreshCount() {
  try {
    const data = await api.getToday();
    state.todayCount = data.count;
    countEl.textContent = `Today: ${data.count} item${data.count === 1 ? '' : 's'} captured`;
  } catch (_) {}
}

// ── UI state machine ─────────────────────────────────────────────────────────
function setMode(mode) {
  state.mode = mode;
  micBtn.className = `mic-btn ${mode}`;

  const labels = {
    idle:       'Say "Hello Jack" to start',
    listening:  'Listening for "Hello Jack"...',
    capturing:  'Recording — say "Done" when finished',
    processing: 'Processing...',
  };
  modeLabel.textContent = labels[mode] || '';

  const icons = {
    idle:       '🎙️',
    listening:  '👂',
    capturing:  '🔴',
    processing: '⏳',
  };
  micIcon.textContent = icons[mode] || '🎙️';

  liveText.textContent = '';
  if (mode !== 'capturing') stopTimer();
  if (mode === 'capturing') startTimer();
}

// ── Silence detection ─────────────────────────────────────────────────────────
function resetSilenceTimer() {
  clearTimeout(state.silenceTimer);
  state.silenceTimer = setTimeout(() => {
    if (state.mode === 'capturing') {
      processCapture();
    }
  }, SILENCE_TIMEOUT_MS);
}

function clearSilenceTimer() {
  clearTimeout(state.silenceTimer);
}

// ── SpeechRecognition ─────────────────────────────────────────────────────────
function buildRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const r = new SpeechRecognition();
  r.continuous = true;
  r.interimResults = true;
  r.lang = 'en-US';

  r.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += t + ' ';
      else interim += t;
    }

    const fullInterim = (state.capturedText + ' ' + final + interim).toLowerCase().trim();

    if (state.mode === 'listening') {
      if (fullInterim.includes(WAKE_WORD)) {
        beep(880, 120);
        setTimeout(() => beep(1100, 120), 150);
        state.capturedText = '';
        setMode('capturing');
        resetSilenceTimer();
      }
    } else if (state.mode === 'capturing') {
      // Strip stop words if present
      const lowerFinal = final.toLowerCase();
      const stopTriggered = STOP_WORDS.some((w) => lowerFinal.includes(w));

      // Accumulate text, removing the stop word itself
      let cleanFinal = final;
      if (stopTriggered) {
        STOP_WORDS.forEach((w) => {
          cleanFinal = cleanFinal.replace(new RegExp(w, 'i'), '');
        });
      }

      state.capturedText += cleanFinal;
      liveText.textContent = state.capturedText.trim();
      resetSilenceTimer();

      if (stopTriggered) {
        clearSilenceTimer();
        beep(660, 120);
        setTimeout(() => beep(550, 200), 150);
        processCapture();
      }
    }
  };

  r.onend = () => {
    // Auto-restart unless we're processing or idle (no recognition)
    if (state.mode === 'listening' || state.mode === 'capturing') {
      try { r.start(); } catch (_) {}
    }
  };

  r.onerror = (e) => {
    if (e.error === 'not-allowed') {
      showToast('Microphone access denied. Please allow mic permissions.', true);
      setMode('idle');
    }
  };

  return r;
}

// ── Start listening (called once on init) ─────────────────────────────────────
function startListening() {
  if (!state.recognition) {
    state.recognition = buildRecognition();
  }

  if (!state.recognition) {
    showToast('SpeechRecognition not supported in this browser. Use Chrome on Android.', true);
    return;
  }

  state.capturedText = '';
  setMode('listening');
  try { state.recognition.start(); } catch (_) {}
}

// ── Manual tap: toggle between listening and capturing ────────────────────────
micBtn.addEventListener('click', () => {
  if (state.mode === 'idle') {
    startListening();
  } else if (state.mode === 'listening') {
    // Manual tap to start capture (fallback for when voice trigger isn't convenient)
    beep(880, 120);
    state.capturedText = '';
    setMode('capturing');
    resetSilenceTimer();
  } else if (state.mode === 'capturing') {
    clearSilenceTimer();
    beep(660, 200);
    processCapture();
  } else if (state.mode === 'processing') {
    // do nothing
  }
});

// ── Process captured text ─────────────────────────────────────────────────────
async function processCapture() {
  const text = state.capturedText.trim();
  state.capturedText = '';
  setMode('processing');

  if (!text) {
    showToast('No speech detected — try again.', true);
    startListening();
    return;
  }

  try {
    const result = await api.processTranscription(text);
    const n = result.actionItems.length;

    if (n === 0) {
      showToast('Heard you, but no action items found.');
    } else {
      showToast(`${n} item${n === 1 ? '' : 's'} added to Notion`);
      refreshCount();
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, true);
  }

  // Return to listening
  startListening();
}

// ── Notion link ───────────────────────────────────────────────────────────────
async function loadNotionLink() {
  try {
    const res = await fetch('/api/notes/today');
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const url = data.items[0].url;
      if (url && notionLink) {
        notionLink.href = url.replace(/\/[a-f0-9-]+$/, ''); // link to DB, not a specific page
      }
    }
  } catch (_) {}
}

// ── Init ──────────────────────────────────────────────────────────────────────
(async function init() {
  await acquireWakeLock();
  await refreshCount();

  try {
    const cfg = await fetch('/api/config').then((r) => r.json());
    if (cfg.notionLink && notionLink) notionLink.href = cfg.notionLink;
  } catch (_) {}

  // Register service worker for PWA installability
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Auto-start listening
  startListening();
})();
