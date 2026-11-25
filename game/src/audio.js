// Sizzle & Serve — tiny WebAudio bleeps. No sound files, everything is
// synthesised in code, so the game stays fully offline.

let audioContext = null;

export function ensureAudio() {
  if (!audioContext) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

export function beep(freq, duration = 0.12, type = 'sine', volume = 0.15) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function soundAdd() {
  beep(660, 0.08, 'triangle', 0.12);
}

export function soundServeGood() {
  beep(523, 0.1, 'sine', 0.15);
  setTimeout(() => beep(659, 0.1, 'sine', 0.15), 90);
  setTimeout(() => beep(784, 0.18, 'sine', 0.18), 180);
}

export function soundServeBad() {
  beep(180, 0.25, 'sawtooth', 0.12);
}

export function soundExpire() {
  beep(140, 0.3, 'square', 0.08);
}

export function soundClick() {
  beep(880, 0.05, 'sine', 0.08);
}

export function soundGameOver() {
  beep(392, 0.15, 'sine', 0.15);
  setTimeout(() => beep(311, 0.15, 'sine', 0.15), 160);
  setTimeout(() => beep(233, 0.35, 'sine', 0.15), 320);
}
