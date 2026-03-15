/**
 * Elegant ringtone generator using Web Audio API.
 * Produces a gentle, iPhone-inspired tri-tone pattern that loops.
 */

let audioContext: AudioContext | null = null;
let isPlaying = false;
let loopTimeout: ReturnType<typeof setTimeout> | null = null;
let currentGain: GainNode | null = null;

const NOTES = [
  { freq: 880, duration: 0.18 },   // A5
  { freq: 1108.73, duration: 0.18 }, // C#6
  { freq: 1318.51, duration: 0.28 }, // E6
];

const PATTERN_GAP = 0.08; // gap between notes in seconds
const LOOP_PAUSE = 2.2;   // pause between pattern repeats

function playPattern(ctx: AudioContext, masterGain: GainNode) {
  let offset = ctx.currentTime + 0.05;

  for (const note of NOTES) {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, offset);

    // Gentle envelope
    noteGain.gain.setValueAtTime(0, offset);
    noteGain.gain.linearRampToValueAtTime(0.25, offset + 0.03);
    noteGain.gain.setValueAtTime(0.25, offset + note.duration * 0.6);
    noteGain.gain.exponentialRampToValueAtTime(0.001, offset + note.duration);

    // Add subtle harmonic overtone for warmth
    const osc2 = ctx.createOscillator();
    const harm2Gain = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(note.freq * 2, offset);
    harm2Gain.gain.setValueAtTime(0, offset);
    harm2Gain.gain.linearRampToValueAtTime(0.06, offset + 0.03);
    harm2Gain.gain.exponentialRampToValueAtTime(0.001, offset + note.duration);

    osc.connect(noteGain);
    osc2.connect(harm2Gain);
    noteGain.connect(masterGain);
    harm2Gain.connect(masterGain);

    osc.start(offset);
    osc.stop(offset + note.duration + 0.05);
    osc2.start(offset);
    osc2.stop(offset + note.duration + 0.05);

    offset += note.duration + PATTERN_GAP;
  }

  const patternDuration = NOTES.reduce((acc, n) => acc + n.duration + PATTERN_GAP, 0);

  return patternDuration;
}

export function startRingtone() {
  if (isPlaying) return;
  isPlaying = true;

  try {
    audioContext = new AudioContext();
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.7, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
    currentGain = masterGain;

    const scheduleLoop = () => {
      if (!isPlaying || !audioContext) return;
      const duration = playPattern(audioContext, masterGain);
      loopTimeout = setTimeout(scheduleLoop, (duration + LOOP_PAUSE) * 1000);
    };

    scheduleLoop();
  } catch (e) {
    console.warn('[Ringtone] Failed to start:', e);
    isPlaying = false;
  }
}

export function stopRingtone() {
  isPlaying = false;

  if (loopTimeout) {
    clearTimeout(loopTimeout);
    loopTimeout = null;
  }

  if (currentGain) {
    try {
      currentGain.gain.linearRampToValueAtTime(0, (audioContext?.currentTime ?? 0) + 0.1);
    } catch { /* noop */ }
    currentGain = null;
  }

  if (audioContext) {
    setTimeout(() => {
      audioContext?.close().catch(() => {});
      audioContext = null;
    }, 200);
  }
}
