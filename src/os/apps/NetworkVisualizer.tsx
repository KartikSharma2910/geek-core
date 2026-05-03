import { useEffect, useState } from "react";

interface Node { id: string; label: string; x: number; y: number; }
interface Edge { a: string; b: string; }

const NODES: Node[] = [
  { id: "you", label: "operator", x: 200, y: 160 },
  { id: "router", label: "router-01", x: 350, y: 160 },
  { id: "fw", label: "firewall", x: 500, y: 90 },
  { id: "srv", label: "srv-cloud", x: 500, y: 230 },
  { id: "iot", label: "iot-cam", x: 230, y: 50 },
  { id: "mob", label: "mobile-12", x: 80, y: 240 },
  { id: "vpn", label: "vpn-exit", x: 620, y: 160 },
];
const EDGES: Edge[] = [
  { a: "you", b: "router" }, { a: "iot", b: "router" }, { a: "mob", b: "router" },
  { a: "router", b: "fw" }, { a: "router", b: "srv" }, { a: "fw", b: "vpn" }, { a: "srv", b: "vpn" },
];

export function NetworkVisualizer() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 60);
    return () => clearInterval(t);
  }, []);
  const map = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div className="p-3 h-full">
      <svg viewBox="0 0 700 320" className="w-full h-full neon-border rounded bg-black/40">
        {EDGES.map((e, i) => {
          const a = map[e.a]; const b = map[e.b];
          const t = ((pulse + i * 13) % 100) / 100;
          const px = a.x + (b.x - a.x) * t;
          const py = a.y + (b.y - a.y) * t;
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--neon)" strokeOpacity="0.35" strokeWidth="1" />
              <circle cx={px} cy={py} r="2.5" fill="var(--neon)" style={{ filter: "drop-shadow(0 0 6px var(--neon))" }} />
            </g>
          );
        })}
        {NODES.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="18" fill="rgba(0,0,0,0.6)" stroke="var(--neon)" />
            <circle cx={n.x} cy={n.y} r={22 + Math.sin(pulse / 10 + n.x) * 3} fill="none" stroke="var(--neon)" strokeOpacity="0.3" />
            <text x={n.x} y={n.y + 36} textAnchor="middle" fill="var(--neon)" fontSize="10" fontFamily="monospace">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 text-[10px] opacity-60">Simulated topology · packets are visual only.</div>
    </div>
  );
}
