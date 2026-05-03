import { useEffect, useState } from "react";
import { useOS } from "./store";
import { sfx } from "./sound";

const LINES = [
  "[ OK ]  Geek OS BIOS v1.0 — Initializing kernel...",
  "[ OK ]  Detecting CPU: Quantum Core i9-NX @ 6.66GHz",
  "[ OK ]  Memory check: 64GB DDR-Neon — passed",
  "[ OK ]  Mounting secure partitions /dev/sda1 /dev/cryptroot",
  "[ .. ]  Loading network modules: tcp, udp, dns, tor",
  "[ OK ]  Establishing encrypted tunnel — handshake complete",
  "[ OK ]  Starting daemon: nyx-shell, geek-wm, particle-fx",
  "[ OK ]  Spawning desktop environment...",
  "[ ✓ ]  Welcome, operator.",
];

export function BootScreen() {
  const setBooted = useOS((s) => s.setBooted);
  const [shown, setShown] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    sfx.boot();
    let i = 0;
    const interval = setInterval(() => {
      setShown((p) => [...p, LINES[i]]);
      setProgress(Math.round(((i + 1) / LINES.length) * 100));
      i++;
      if (i >= LINES.length) {
        clearInterval(interval);
        setTimeout(() => setGlitch(true), 400);
        setTimeout(() => setBooted(true), 1400);
      }
    }, 320);
    return () => clearInterval(interval);
  }, [setBooted]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black text-[var(--neon)] font-mono p-6 md:p-10 overflow-hidden ${
        glitch ? "animate-pulse" : ""
      }`}
    >
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-3 w-3 rounded-full bg-[var(--neon)] pulse-glow" />
          <span className="neon-text text-xl tracking-[0.3em]">GEEK//OS</span>
          <span className="text-xs opacity-60">v1.0 — secure-boot</span>
        </div>
        <div className="text-xs md:text-sm space-y-1 leading-relaxed">
          {shown.map((l, i) => (
            <div key={i} className="opacity-90">
              <span className="opacity-60">{String(i + 1).padStart(2, "0")}</span>{" "}
              <span>{l}</span>
            </div>
          ))}
          <div className="cursor-blink inline-block w-2 h-4 bg-[var(--neon)] align-middle" />
        </div>
        <div className="mt-8 max-w-md">
          <div className="flex justify-between text-[10px] mb-2 opacity-70">
            <span>BOOT PROGRESS</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-[var(--neon-dim)]/20 overflow-hidden">
            <div
              className="h-full bg-[var(--neon)] transition-all duration-300"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 12px var(--neon)",
              }}
            />
          </div>
        </div>
      </div>
      <div
        className="absolute left-0 right-0 h-px bg-[var(--neon)]/40 scan-bar pointer-events-none"
        style={{ boxShadow: "0 0 24px var(--neon)" }}
      />
    </div>
  );
}
