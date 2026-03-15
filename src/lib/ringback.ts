/**
 * Ringback tone generator using Web Audio API.
 * Produces a Skype-style "calling pulse" — the sound the CALLER hears while waiting.
 * Pattern: two short tones with a pause, repeating.
 */

let audioContext: AudioContext | null = null;
let isPlaying = false;
let loopTimeout: ReturnType<typeof setTimeout> | null = null;
let currentGain: GainNode | null = null;

// Skype-style double pulse: two tones, pause, repeat
const PULSE_FREQ = 440; // A4 — warm, professional
const PULSE_DURATION = 0.8; // each pulse length in seconds
const PULSE_GAP = 0.4; // gap between the two pulses
const LOOP_PAUSE = 3.0; // pause before next double-pulse

function playPulse(ctx: AudioContext, masterGain: GainNode, startTime: number) {
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(PULSE_FREQ, startTime);

  // Smooth envelope: fade in, sustain, fade out
  noteGain.gain.setValueAtTime(0, startTime);
  noteGain.gain.linearRampToValueAtTime(0.18, startTime + 0.06);
  noteGain.gain.setValueAtTime(0.18, startTime + PULSE_DURATION - 0.1);
  noteGain.gain.linearRampToValueAtTime(0, startTime + PULSE_DURATION);

  // Subtle second harmonic for warmth
  const osc2 = ctx.createOscillator();
  const harmGain = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(PULSE_FREQ * 1.5, startTime); // fifth
  harmGain.gain.setValueAtTime(0, startTime);
  harmGain.gain.linearRampToValueAtTime(0.04, startTime + 0.06);
  harmGain.gain.linearRampToValueAtTime(0, startTime + PULSE_DURATION);

  osc.connect(noteGain);
  osc2.connect(harmGain);
  noteGain.connect(masterGain);
  harmGain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + PULSE_DURATION + 0.05);
  osc2.start(startTime);
  osc2.stop(startTime + PULSE_DURATION + 0.05);
}

function playDoublePulse(ctx: AudioContext, masterGain: GainNode) {
  const now = ctx.currentTime + 0.05;
  playPulse(ctx, masterGain, now);
  playPulse(ctx, masterGain, now + PULSE_DURATION + PULSE_GAP);
}

export function startRingback() {
  if (isPlaying) return;
  isPlaying = true;

  try {
    audioContext = new AudioContext();
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.6, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
    currentGain = masterGain;

    const totalCycleDuration = (PULSE_DURATION * 2 + PULSE_GAP + LOOP_PAUSE) * 1000;

    const scheduleLoop = () => {
      if (!isPlaying || !audioContext) return;
      playDoublePulse(audioContext, masterGain);
      loopTimeout = setTimeout(scheduleLoop, totalCycleDuration);
    };

    scheduleLoop();
  } catch (e) {
    console.warn('[Ringback] Failed to start:', e);
    isPlaying = false;
  }
}

export function stopRingback() {
  isPlaying = false;

  if (loopTimeout) {
    clearTimeout(loopTimeout);
    loopTimeout = null;
  }

  if (currentGain) {
    try {
      currentGain.gain.linearRampToValueAtTime(0, (audioContext?.currentTime ?? 0) + 0.15);
    } catch { /* noop */ }
    currentGain = null;
  }

  if (audioContext) {
    setTimeout(() => {
      audioContext?.close().catch(() => {});
      audioContext = null;
    }, 300);
  }
}
