import { useOS, type ThemeName, type Wallpaper } from "../store";
import { WALLPAPERS } from "../wallpapers";

const THEMES: { id: ThemeName; label: string; color: string }[] = [
  { id: "green", label: "Neon Green", color: "oklch(0.88 0.22 150)" },
  { id: "purple", label: "Cyber Purple", color: "oklch(0.78 0.25 305)" },
  { id: "red", label: "Bloodmoon", color: "oklch(0.72 0.25 25)" },
  { id: "amber", label: "Amber CRT", color: "oklch(0.82 0.18 75)" },
  { id: "ice", label: "Ice Blue", color: "oklch(0.85 0.18 220)" },
];

export function Settings() {
  const {
    theme,
    setTheme,
    scanlines,
    setScanlines,
    matrixBg,
    setMatrixBg,
    wallpaper,
    setWallpaper,
    sound,
    setSound,
    termPrompt,
    setTermPrompt,
    termColor,
    setTermColor,
  } = useOS();

  const reset = () => {
    if (confirm("Reset all Geek OS data (settings, achievements, CTF score)?")) {
      localStorage.removeItem("geekos-state");
      location.reload();
    }
  };

  return (
    <div className="p-5 space-y-6 text-sm">
      <section>
        <h3 className="text-xs uppercase tracking-widest opacity-70 mb-2">Theme</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`neon-border rounded p-3 text-left ${theme === t.id ? "bg-[var(--neon)]/15" : "hover:bg-[var(--neon)]/10"}`}
            >
              <div
                className="h-6 w-6 rounded-full mb-2"
                style={{ background: t.color, boxShadow: `0 0 12px ${t.color}` }}
              />
              <div className="text-xs">{t.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-widest opacity-70 mb-2">Wallpaper</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(WALLPAPERS) as Wallpaper[]).map((w) => (
            <button
              key={w}
              onClick={() => setWallpaper(w)}
              className={`neon-border rounded overflow-hidden text-left ${wallpaper === w ? "ring-2 ring-[var(--neon)]" : ""}`}
            >
              <div className="h-16" style={WALLPAPERS[w].style} />
              <div className="px-2 py-1 text-[10px]">{WALLPAPERS[w].label}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs uppercase tracking-widest opacity-70">Effects</h3>
        <Toggle label="CRT scanlines" value={scanlines} onChange={setScanlines} />
        <Toggle label="Matrix rain background" value={matrixBg} onChange={setMatrixBg} />
        <Toggle label="Sound effects" value={sound} onChange={setSound} />
      </section>

      <section className="space-y-2">
        <h3 className="text-xs uppercase tracking-widest opacity-70">Terminal</h3>
        <label className="block">
          <span className="text-xs opacity-70">Prompt</span>
          <input
            value={termPrompt}
            onChange={(e) => setTermPrompt(e.target.value)}
            className="w-full bg-black/50 neon-border rounded px-2 py-1.5 font-mono text-xs mt-1"
          />
        </label>
        <label className="block">
          <span className="text-xs opacity-70">Text color (any CSS color)</span>
          <div className="flex gap-2 mt-1">
            <input
              value={termColor}
              onChange={(e) => setTermColor(e.target.value)}
              className="flex-1 bg-black/50 neon-border rounded px-2 py-1.5 font-mono text-xs"
            />
            <div className="w-10 neon-border rounded" style={{ background: termColor }} />
          </div>
        </label>
      </section>

      <section className="border-t border-[var(--neon)]/20 pt-3 flex items-center justify-between">
        <div className="text-[10px] opacity-50">
          Geek OS · Cyberglow build 1.0 · settings persist locally.
        </div>
        <button
          onClick={reset}
          className="text-xs neon-border rounded px-3 py-1 hover:bg-destructive/30"
        >
          Reset all
        </button>
      </section>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex justify-between items-center px-3 py-2 neon-border rounded hover:bg-[var(--neon)]/10"
    >
      <span>{label}</span>
      <span
        className={`h-4 w-8 rounded-full relative transition ${value ? "bg-[var(--neon)]/60" : "bg-[var(--neon)]/15"}`}
      >
        <span
          className="absolute top-0.5 h-3 w-3 rounded-full bg-[var(--neon)] transition-all"
          style={{ left: value ? "calc(100% - 14px)" : "2px", boxShadow: "0 0 6px var(--neon)" }}
        />
      </span>
    </button>
  );
}
