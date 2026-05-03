import { useEffect, useState } from "react";

interface Stats {
  cores: number | string;
  mem: number | string;
  online: boolean;
  conn: string;
  downlink: number | string;
  battery: { level: number; charging: boolean } | null;
  platform: string;
  ua: string;
}

function Bar({
  label,
  value,
  max = 100,
  unit = "%",
}: {
  label: string;
  value: number;
  max?: number;
  unit?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 opacity-80">
        <span>{label}</span>
        <span className="neon-text">
          {value.toFixed(1)}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-[var(--neon)]/15 rounded">
        <div
          className="h-full rounded bg-[var(--neon)] transition-all"
          style={{ width: `${pct}%`, boxShadow: "0 0 10px var(--neon)" }}
        />
      </div>
    </div>
  );
}

export function SystemMonitor() {
  const [cpu, setCpu] = useState<number[]>(Array(40).fill(20));
  const [stats, setStats] = useState<Stats>({
    cores: "—",
    mem: "—",
    online: true,
    conn: "unknown",
    downlink: "—",
    battery: null,
    platform: "—",
    ua: "—",
  });
  const [fpsHist, setFpsHist] = useState<number[]>([]);

  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: {
        effectiveType?: string;
        downlink?: number;
        addEventListener?: (e: string, f: () => void) => void;
      };
      getBattery?: () => Promise<{
        level: number;
        charging: boolean;
        addEventListener: (e: string, f: () => void) => void;
      }>;
    };
    const refresh = () =>
      setStats((s) => ({
        ...s,
        cores: nav.hardwareConcurrency ?? "?",
        mem: nav.deviceMemory ?? "?",
        online: navigator.onLine,
        conn: nav.connection?.effectiveType ?? "unknown",
        downlink: nav.connection?.downlink ?? "—",
        platform: navigator.platform,
        ua: navigator.userAgent,
      }));
    refresh();
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    nav.connection?.addEventListener?.("change", refresh);
    nav.getBattery?.().then((b) => {
      const upd = () =>
        setStats((s) => ({ ...s, battery: { level: b.level, charging: b.charging } }));
      upd();
      b.addEventListener("levelchange", upd);
      b.addEventListener("chargingchange", upd);
    });
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
    };
  }, []);

  // FPS-based "CPU" estimator: lower fps => higher pseudo-load
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        const fps = frames;
        frames = 0;
        last = now;
        setFpsHist((h) => [...h.slice(-39), fps]);
        const load = Math.max(2, Math.min(100, (60 - fps) * 1.6 + 8 + Math.random() * 4));
        setCpu((c) => [...c.slice(1), load]);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const memEst = typeof stats.mem === "number" ? Math.min(100, 30 + Math.random() * 20) : 0;
  const battPct = stats.battery ? stats.battery.level * 100 : 0;

  return (
    <div className="p-4 space-y-4 text-sm">
      <div>
        <div className="flex justify-between text-xs mb-1 opacity-80">
          <span>CPU load (FPS-derived)</span>
          <span className="neon-text">{cpu[cpu.length - 1].toFixed(0)}%</span>
        </div>
        <svg viewBox="0 0 400 80" className="w-full h-24 neon-border rounded bg-black/40">
          <polyline
            fill="none"
            stroke="var(--neon)"
            strokeWidth="1.5"
            points={cpu
              .map((v, i) => `${(i / (cpu.length - 1)) * 400},${80 - (v / 100) * 75}`)
              .join(" ")}
            style={{ filter: "drop-shadow(0 0 4px var(--neon))" }}
          />
        </svg>
        <div className="text-[10px] opacity-60 mt-1">
          avg fps ≈{" "}
          {fpsHist.length ? Math.round(fpsHist.reduce((a, b) => a + b, 0) / fpsHist.length) : 0}
        </div>
      </div>

      {typeof stats.mem === "number" && (
        <Bar label={`Memory (~${stats.mem} GB device)`} value={memEst} />
      )}
      {stats.battery && (
        <Bar
          label={`Battery — ${stats.battery.charging ? "charging ⚡" : "on battery"}`}
          value={battPct}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-[10px]">
        {[
          ["CPU threads", stats.cores],
          ["Device memory", typeof stats.mem === "number" ? `${stats.mem} GB` : stats.mem],
          ["Platform", stats.platform],
          ["Network", stats.online ? `online (${stats.conn})` : "offline"],
          [
            "Downlink",
            typeof stats.downlink === "number" ? `${stats.downlink} Mbps` : stats.downlink,
          ],
          ["Battery", stats.battery ? `${battPct.toFixed(0)}%` : "n/a"],
        ].map(([k, v]) => (
          <div key={String(k)} className="neon-border rounded p-2 bg-black/30">
            <div className="opacity-60 uppercase tracking-wider">{k}</div>
            <div className="neon-text text-sm break-words">{String(v)}</div>
          </div>
        ))}
      </div>

      <details className="text-[10px] opacity-70">
        <summary className="cursor-pointer">User agent</summary>
        <pre className="whitespace-pre-wrap break-words mt-1">{stats.ua}</pre>
      </details>
    </div>
  );
}
