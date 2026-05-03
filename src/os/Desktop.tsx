import { useEffect, useRef, useState } from "react";
import { useOS, type AppId, APP_TITLE } from "./store";
import { Window } from "./Window";
import { Terminal } from "./apps/Terminal";
import { SystemMonitor } from "./apps/SystemMonitor";
import { PasswordAnalyzer } from "./apps/PasswordAnalyzer";
import { NetworkVisualizer } from "./apps/NetworkVisualizer";
import { ApiInspector } from "./apps/ApiInspector";
import { CyberLab } from "./apps/CyberLab";
import { LearningHub } from "./apps/LearningHub";
import { Challenges } from "./apps/Challenges";
import { Settings } from "./apps/Settings";
import { About } from "./apps/About";
import { WifiCracker } from "./apps/WifiCracker";
import { Achievements } from "./apps/Achievements";
import { VPN } from "./apps/Vpn";
import { WALLPAPERS } from "./wallpapers";
import { sfx } from "./sound";
import {
  TerminalSquare,
  Activity,
  KeyRound,
  Network,
  Globe,
  FlaskConical,
  GraduationCap,
  Gamepad2,
  Settings as SettingsIcon,
  Info,
  Power,
  Search,
  Wifi,
  Trophy,
  Shield,
  Palette,
  Volume2,
  VolumeX,
} from "lucide-react";

const ICONS: Record<AppId, React.ComponentType<{ className?: string }>> = {
  terminal: TerminalSquare,
  monitor: Activity,
  password: KeyRound,
  network: Network,
  api: Globe,
  lab: FlaskConical,
  learn: GraduationCap,
  challenges: Gamepad2,
  wifi: Wifi,
  achievements: Trophy,
  vpn: Shield,
  settings: SettingsIcon,
  about: Info,
};

const DESKTOP_APPS: AppId[] = [
  "terminal",
  "monitor",
  "password",
  "network",
  "wifi",
  "vpn",
  "api",
  "lab",
  "learn",
  "challenges",
  "achievements",
];

function renderApp(appId: AppId) {
  switch (appId) {
    case "terminal":
      return <Terminal />;
    case "monitor":
      return <SystemMonitor />;
    case "password":
      return <PasswordAnalyzer />;
    case "network":
      return <NetworkVisualizer />;
    case "api":
      return <ApiInspector />;
    case "lab":
      return <CyberLab />;
    case "learn":
      return <LearningHub />;
    case "challenges":
      return <Challenges />;
    case "wifi":
      return <WifiCracker />;
    case "achievements":
      return <Achievements />;
    case "vpn":
      return <VPN />;
    case "settings":
      return <Settings />;
    case "about":
      return <About />;
  }
}

const DEFAULT_POS = (i: number) => ({ x: 24, y: 24 + i * 96 });

export function Desktop() {
  const {
    windows,
    open,
    theme,
    scanlines,
    setScanlines,
    matrixBg,
    setMatrixBg,
    sound,
    setSound,
    wallpaper,
    setWallpaper,
    iconPositions,
    setIconPosition,
  } = useOS();
  const [wpToast, setWpToast] = useState<string | null>(null);
  const cycleWallpaper = () => {
    const keys = Object.keys(WALLPAPERS) as (keyof typeof WALLPAPERS)[];
    const next = keys[(keys.indexOf(wallpaper) + 1) % keys.length];
    setWallpaper(next);
    sfx.click();
    setWpToast(WALLPAPERS[next].label);
    setTimeout(() => setWpToast(null), 1400);
  };
  const [now, setNow] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [personalize, setPersonalize] = useState(false);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const [search, setSearch] = useState("");
  const [online, setOnline] = useState(true);
  const [batt, setBatt] = useState<number | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove(
      "theme-purple",
      "theme-red",
      "theme-amber",
      "theme-ice",
    );
    if (theme !== "green") document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{
        level: number;
        addEventListener: (e: string, f: () => void) => void;
      }>;
    };
    nav.getBattery?.().then((b) => {
      const upd = () => setBatt(Math.round(b.level * 100));
      upd();
      b.addEventListener("levelchange", upd);
    });
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const startDragIcon = (id: AppId, e: React.MouseEvent) => {
    e.preventDefault();
    const start = iconPositions[id] ?? DEFAULT_POS(DESKTOP_APPS.indexOf(id));
    const sx = e.clientX,
      sy = e.clientY;
    let moved = false;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - sx,
        dy = ev.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      setIconPosition(id, Math.max(0, start.x + dx), Math.max(0, start.y + dy));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (!moved) {
        open(id);
        sfx.open();
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const filtered = (Object.keys(ICONS) as AppId[]).filter((id) =>
    APP_TITLE(id).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      ref={desktopRef}
      className={`fixed inset-0 ${scanlines ? "scanlines" : ""} wallpaper-${wallpaper}`}
      style={WALLPAPERS[wallpaper].style}
      onClick={() => {
        setMenuOpen(false);
        setCtx(null);
        setPersonalize(false);
      }}
      onDoubleClick={cycleWallpaper}
      onContextMenu={(e) => {
        e.preventDefault();
        setCtx({ x: e.clientX, y: e.clientY });
      }}
    >
      {wpToast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[9500] glass-strong neon-border rounded-md px-4 py-2 text-xs neon-text pointer-events-none animate-fade-in">
          Wallpaper · {wpToast}
        </div>
      )}
      {/* Glitch overlay */}
      <div className="glitch-overlay" aria-hidden />
      <div className="glitch-bar" aria-hidden />
      {/* Desktop icons (draggable) */}
      {DESKTOP_APPS.map((id, i) => {
        const Icon = ICONS[id];
        const pos = iconPositions[id] ?? DEFAULT_POS(i);
        return (
          <button
            key={id}
            onMouseDown={(e) => {
              e.stopPropagation();
              startDragIcon(id, e);
            }}
            onDoubleClick={() => {
              open(id);
              sfx.open();
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ left: pos.x, top: pos.y }}
            className="absolute z-10 group flex flex-col items-center gap-1 w-20 p-2 rounded-md hover:bg-[var(--neon)]/10 transition select-none cursor-grab active:cursor-grabbing"
          >
            <div className="h-12 w-12 rounded-md neon-border glass flex items-center justify-center group-hover:pulse-glow">
              <Icon className="h-6 w-6 text-[var(--neon)]" />
            </div>
            <span className="text-[10px] text-center neon-text leading-tight">{APP_TITLE(id)}</span>
          </button>
        );
      })}

      {/* Top-right HUD */}
      <div className="absolute top-4 right-6 z-10 text-right text-xs font-mono space-y-1 opacity-80 flicker pointer-events-none">
        <span className="glitch-text neon-text text-sm tracking-widest" data-text="GEEK//OS">
          GEEK//OS
        </span>
        <div>OPERATOR @ localhost</div>
        <div>UPTIME · {Math.floor(performance.now() / 1000)}s</div>
      </div>

      {/* Windows */}
      {windows.map((w) => (
        <Window key={w.id} win={w}>
          {renderApp(w.appId)}
        </Window>
      ))}

      {/* Context menu */}
      {ctx && (
        <div
          className="fixed z-[9000] glass-strong neon-border rounded-md py-1 text-xs min-w-44"
          style={{
            left: Math.min(ctx.x, window.innerWidth - 200),
            top: Math.min(ctx.y, window.innerHeight - 200),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: "Open Terminal", action: () => open("terminal") },
            { label: "Personalize…", action: () => setPersonalize(true) },
            { label: "Change wallpaper", action: cycleWallpaper },
            { label: "System Settings", action: () => open("settings") },
            { label: "Achievements", action: () => open("achievements") },
            { label: "About Geek OS", action: () => open("about") },
            { label: "Refresh desktop", action: () => location.reload() },
          ].map((m) => (
            <button
              key={m.label}
              onClick={() => {
                m.action();
                sfx.click();
                setCtx(null);
              }}
              className="block w-full text-left px-3 py-1.5 hover:bg-[var(--neon)]/15 hover:text-[var(--neon)]"
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Start menu */}
      {menuOpen && (
        <div
          className="fixed bottom-14 left-3 right-3 sm:right-auto z-[8500] glass-strong neon-border rounded-lg p-3 sm:w-72"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-3 text-xs opacity-70">
            <Search className="h-3 w-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps..."
              className="bg-transparent outline-none flex-1 text-xs"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((id) => {
              const Icon = ICONS[id];
              return (
                <button
                  key={id}
                  onClick={() => {
                    open(id);
                    setMenuOpen(false);
                    sfx.open();
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-[var(--neon)]/15"
                >
                  <Icon className="h-5 w-5 text-[var(--neon)]" />
                  <span className="text-[10px] text-center">{APP_TITLE(id)}</span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-[var(--neon)]/20 mt-3 pt-2 flex justify-between text-xs">
            <span className="opacity-60">operator</span>
            <button
              className="flex items-center gap-1 opacity-70 hover:text-[var(--neon)]"
              onClick={() => location.reload()}
            >
              <Power className="h-3 w-3" /> Reboot
            </button>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div
        className="fixed bottom-2 left-2 right-2 h-12 z-[8000] glass-strong neon-border rounded-xl flex items-center px-2 gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            setMenuOpen((v) => !v);
            sfx.click();
          }}
          className="h-9 px-3 rounded-md hover:bg-[var(--neon)]/15 flex items-center gap-2 text-xs neon-text"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--neon)] pulse-glow" />
          START
        </button>
        <div className="h-6 w-px bg-[var(--neon)]/30" />
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {windows.map((w) => {
            const Icon = ICONS[w.appId];
            return (
              <button
                key={w.id}
                onClick={() => useOS.getState().focus(w.id)}
                className="h-8 px-2 rounded-md hover:bg-[var(--neon)]/15 flex items-center gap-1.5 text-xs whitespace-nowrap"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--neon)]" />
                <span className="hidden md:inline">{w.title}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 px-1">
          <button
            title="Personalize"
            onClick={() => {
              setPersonalize((v) => !v);
              sfx.click();
            }}
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-[var(--neon)]/15"
          >
            <Palette className="h-4 w-4 text-[var(--neon)]" />
          </button>
          <button
            title={sound ? "Mute" : "Unmute"}
            onClick={() => setSound(!sound)}
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-[var(--neon)]/15"
          >
            {sound ? (
              <Volume2 className="h-4 w-4 text-[var(--neon)]" />
            ) : (
              <VolumeX className="h-4 w-4 opacity-60" />
            )}
          </button>
          <button
            title="VPN"
            onClick={() => {
              open("vpn");
              sfx.open();
            }}
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-[var(--neon)]/15"
          >
            <Shield className="h-4 w-4 text-[var(--neon)]" />
          </button>
          <button
            title="Settings"
            onClick={() => {
              open("settings");
              sfx.open();
            }}
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-[var(--neon)]/15"
          >
            <SettingsIcon className="h-4 w-4 text-[var(--neon)]" />
          </button>
        </div>
        <div className="text-xs opacity-90 px-2 flex items-center gap-2 sm:gap-3">
          <span className={online ? "text-[var(--neon)]" : "text-red-400"} title="Network">
            {online ? "●" : "✕"}
          </span>
          {batt !== null && <span className="hidden sm:inline">{batt}%</span>}
          <span className="neon-text font-mono">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Personalize panel */}
      {personalize && (
        <div
          className="fixed bottom-16 right-3 z-[8600] glass-strong neon-border rounded-lg p-3 w-72 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 neon-text text-xs">
            <Palette className="h-3.5 w-3.5" /> Personalize
          </div>
          <div>
            <div className="text-[10px] opacity-60 mb-1">Wallpaper</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(WALLPAPERS) as (keyof typeof WALLPAPERS)[]).map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    setWallpaper(w);
                    sfx.click();
                  }}
                  className={`neon-border rounded overflow-hidden text-left ${wallpaper === w ? "ring-2 ring-[var(--neon)]" : ""}`}
                >
                  <div className="h-10" style={WALLPAPERS[w].style} />
                  <div className="px-1.5 py-0.5 text-[9px] truncate">{WALLPAPERS[w].label}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Quick label="CRT scanlines" value={scanlines} onChange={setScanlines} />
            <Quick label="Matrix rain (live wallpaper)" value={matrixBg} onChange={setMatrixBg} />
            <Quick label="Sound effects" value={sound} onChange={setSound} />
          </div>
          <button
            onClick={() => {
              open("settings");
              setPersonalize(false);
            }}
            className="w-full text-xs neon-border rounded px-2 py-1.5 hover:bg-[var(--neon)]/15"
          >
            More settings →
          </button>
        </div>
      )}
    </div>
  );
}

function Quick({
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
      className="w-full flex justify-between items-center px-2 py-1 text-xs hover:bg-[var(--neon)]/10 rounded"
    >
      <span>{label}</span>
      <span
        className={`h-3.5 w-7 rounded-full relative ${value ? "bg-[var(--neon)]/60" : "bg-[var(--neon)]/15"}`}
      >
        <span
          className="absolute top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--neon)] transition-all"
          style={{ left: value ? "calc(100% - 12px)" : "2px" }}
        />
      </span>
    </button>
  );
}
