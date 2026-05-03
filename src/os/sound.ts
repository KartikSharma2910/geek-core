import { useOS } from "./store";

let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function tone(freq: number, dur = 0.08, type: OscillatorType = "square", gain = 0.04) {
  if (!useOS.getState().sound) return;
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(a.destination);
  const t = a.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur);
}

export const sfx = {
  click: () => tone(880, 0.04, "square", 0.025),
  key: () => tone(1400 + Math.random() * 400, 0.02, "square", 0.015),
  open: () => {
    tone(520, 0.06);
    setTimeout(() => tone(820, 0.07), 50);
  },
  close: () => {
    tone(700, 0.05);
    setTimeout(() => tone(380, 0.07), 40);
  },
  boot: () => {
    [220, 330, 440, 660, 880].forEach((f, i) =>
      setTimeout(() => tone(f, 0.12, "sawtooth", 0.05), i * 110),
    );
  },
  achievement: () => {
    [660, 880, 1100].forEach((f, i) => setTimeout(() => tone(f, 0.1, "triangle", 0.05), i * 80));
  },
  error: () => tone(180, 0.18, "sawtooth", 0.05),
};
