/**
 * Synthesizes subtle chess sound effects using the browser Web Audio API
 * (zero external audio files required).
 */

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext;
  if (!Ctx) return null;
  audioCtx ??= new Ctx();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.08) {
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  vol.gain.setValueAtTime(gain, ctx.currentTime);
  vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(vol);
  vol.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playChessSound(
  kind: "move" | "capture" | "check" | "gameover",
) {
  try {
    if (kind === "move") tone(280, 0.06, "triangle", 0.07);
    else if (kind === "capture") tone(190, 0.09, "sawtooth", 0.07);
    else if (kind === "check") tone(520, 0.14, "sine", 0.09);
    else {
      tone(392, 0.12, "triangle", 0.08);
      setTimeout(() => tone(523, 0.18, "triangle", 0.08), 110);
    }
  } catch {
    // Audio playback may be blocked prior to user interaction.
  }
}
