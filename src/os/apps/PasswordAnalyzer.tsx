import { useMemo, useState } from "react";

function analyze(pwd: string) {
  let pool = 0;
  if (/[a-z]/.test(pwd)) pool += 26;
  if (/[A-Z]/.test(pwd)) pool += 26;
  if (/\d/.test(pwd)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pwd)) pool += 32;
  const entropy = pwd.length * Math.log2(Math.max(pool, 1) || 1);
  const guessesPerSec = 1e10;
  const seconds = Math.pow(2, entropy) / guessesPerSec;
  return { entropy, seconds, pool };
}

function fmt(s: number) {
  if (s < 1) return "instantly";
  const u: [number, string][] = [
    [60, "seconds"],
    [60, "minutes"],
    [24, "hours"],
    [365, "days"],
    [100, "years"],
    [1e6, "centuries"],
  ];
  let v = s,
    name = "seconds";
  for (const [d, n] of u) {
    if (v < d) {
      name = n;
      break;
    }
    v /= d;
    name = n;
  }
  return `${v.toFixed(1)} ${name}`;
}

export function PasswordAnalyzer() {
  const [pwd, setPwd] = useState("");
  const r = useMemo(() => analyze(pwd), [pwd]);
  const score = Math.min(100, (r.entropy / 80) * 100);
  const label = score < 25 ? "weak" : score < 55 ? "okay" : score < 80 ? "strong" : "fortress";
  const tips: string[] = [];
  if (pwd.length < 12) tips.push("Use at least 12 characters.");
  if (!/[A-Z]/.test(pwd)) tips.push("Add uppercase letters.");
  if (!/\d/.test(pwd)) tips.push("Add digits.");
  if (!/[^A-Za-z0-9]/.test(pwd)) tips.push("Mix in symbols (!@#$).");
  if (/(.)\1{2,}/.test(pwd)) tips.push("Avoid repeated characters.");
  if (!tips.length && pwd) tips.push("Looks great. Store it in a password manager.");

  return (
    <div className="p-5 space-y-4 text-sm">
      <div>
        <label className="text-xs opacity-70 uppercase tracking-widest">Test password</label>
        <input
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="enter a passphrase..."
          className="mt-1 w-full bg-black/40 neon-border rounded px-3 py-2 outline-none font-mono"
          type="text"
        />
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="opacity-70">Strength</span>
          <span className="neon-text uppercase">{label}</span>
        </div>
        <div className="h-3 bg-[var(--neon)]/15 rounded">
          <div
            className="h-full rounded transition-all"
            style={{
              width: `${score}%`,
              background: score < 55 ? "oklch(0.7 0.2 40)" : "var(--neon)",
              boxShadow: "0 0 12px var(--neon)",
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        {[
          ["Entropy", `${r.entropy.toFixed(1)} bits`],
          ["Charset", `${r.pool} chars`],
          ["Crack time", fmt(r.seconds)],
        ].map(([k, v]) => (
          <div key={k} className="neon-border rounded p-3 bg-black/30">
            <div className="opacity-60 uppercase text-[10px]">{k}</div>
            <div className="neon-text text-sm mt-1 break-words">{v}</div>
          </div>
        ))}
      </div>
      <div className="neon-border rounded p-3 bg-black/30">
        <div className="text-xs uppercase opacity-60 mb-2">Suggestions</div>
        <ul className="text-xs space-y-1 list-disc list-inside">
          {tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <p className="text-[10px] opacity-50">
        Educational estimate assuming 10⁹ guesses/second offline attack.
      </p>
    </div>
  );
}
