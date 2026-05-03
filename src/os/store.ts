import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AppId =
  | "terminal" | "monitor" | "password" | "network" | "api"
  | "lab" | "learn" | "challenges" | "wifi" | "achievements"
  | "vpn" | "settings" | "about";

export interface WindowState {
  id: string; appId: AppId; title: string;
  x: number; y: number; w: number; h: number; z: number;
  minimized: boolean; maximized: boolean;
}

export type ThemeName = "green" | "purple" | "red" | "amber" | "ice";
export type Wallpaper = "matrix" | "circuit" | "grid" | "nebula" | "void";

const APP_TITLES: Record<AppId, string> = {
  terminal: "Terminal",
  monitor: "System Monitor",
  password: "Password Analyzer",
  network: "Network Visualizer",
  api: "API Inspector",
  lab: "Cyber Lab",
  learn: "Learning Hub",
  challenges: "CTF Challenges",
  wifi: "WiFi Cracker",
  achievements: "Achievements",
  vpn: "VPN Shield",
  settings: "Settings",
  about: "About Geek OS",
};
export const APP_TITLE = (a: AppId) => APP_TITLES[a];

interface OSState {
  booted: boolean; setBooted: (b: boolean) => void;
  windows: WindowState[]; topZ: number;
  open: (appId: AppId) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
  toggleMin: (id: string) => void;
  toggleMax: (id: string) => void;

  // persisted settings
  theme: ThemeName; setTheme: (t: ThemeName) => void;
  scanlines: boolean; setScanlines: (v: boolean) => void;
  matrixBg: boolean; setMatrixBg: (v: boolean) => void;
  wallpaper: Wallpaper; setWallpaper: (w: Wallpaper) => void;
  sound: boolean; setSound: (v: boolean) => void;
  termPrompt: string; setTermPrompt: (s: string) => void;
  termColor: string; setTermColor: (s: string) => void;

  // persisted progress
  iconPositions: Record<string, { x: number; y: number }>;
  setIconPosition: (id: string, x: number, y: number) => void;
  achievements: string[];
  unlock: (id: string) => void;
  ctfSolved: string[];
  markCtf: (id: string) => void;
  ctfScore: number;
  addScore: (n: number) => void;
  lessonsDone: string[];
  toggleLesson: (id: string) => void;
}

export const useOS = create<OSState>()(
  persist(
    (set, get) => ({
      booted: false,
      setBooted: (b) => set({ booted: b }),
      windows: [],
      topZ: 10,
      open: (appId) => {
        const existing = get().windows.find((w) => w.appId === appId);
        if (existing) {
          get().focus(existing.id);
          if (existing.minimized) get().toggleMin(existing.id);
          return;
        }
        const z = get().topZ + 1;
        const id = `${appId}-${Date.now()}`;
        const offset = (get().windows.length % 6) * 28;
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const isMobile = vw < 768;
        set((s) => ({
          topZ: z,
          windows: [
            ...s.windows,
            {
              id, appId, title: APP_TITLES[appId],
              x: isMobile ? 8 : 80 + offset,
              y: isMobile ? 8 : 60 + offset,
              w: isMobile ? vw - 16 : 720,
              h: isMobile ? window.innerHeight - 80 : 460,
              z, minimized: false,
              maximized: isMobile,
            },
          ],
        }));
      },
      close: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),
      focus: (id) =>
        set((s) => {
          const z = s.topZ + 1;
          return { topZ: z, windows: s.windows.map((w) => (w.id === id ? { ...w, z } : w)) };
        }),
      move: (id, x, y) =>
        set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)) })),
      resize: (id, w, h) =>
        set((s) => ({ windows: s.windows.map((win) => (win.id === id ? { ...win, w, h } : win)) })),
      toggleMin: (id) =>
        set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)) })),
      toggleMax: (id) =>
        set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)) })),

      theme: "green",
      setTheme: (t) => set({ theme: t }),
      scanlines: true,
      setScanlines: (v) => set({ scanlines: v }),
      matrixBg: true,
      setMatrixBg: (v) => set({ matrixBg: v }),
      wallpaper: "matrix",
      setWallpaper: (w) => set({ wallpaper: w }),
      sound: true,
      setSound: (v) => set({ sound: v }),
      termPrompt: "operator@geek:~$",
      setTermPrompt: (s) => set({ termPrompt: s }),
      termColor: "var(--neon)",
      setTermColor: (s) => set({ termColor: s }),

      iconPositions: {},
      setIconPosition: (id, x, y) =>
        set((s) => ({ iconPositions: { ...s.iconPositions, [id]: { x, y } } })),
      achievements: [],
      unlock: (id) =>
        set((s) => (s.achievements.includes(id) ? s : { achievements: [...s.achievements, id] })),
      ctfSolved: [],
      markCtf: (id) =>
        set((s) => (s.ctfSolved.includes(id) ? s : { ctfSolved: [...s.ctfSolved, id] })),
      ctfScore: 0,
      addScore: (n) => set((s) => ({ ctfScore: s.ctfScore + n })),
      lessonsDone: [],
      toggleLesson: (id) =>
        set((s) => ({
          lessonsDone: s.lessonsDone.includes(id)
            ? s.lessonsDone.filter((x) => x !== id)
            : [...s.lessonsDone, id],
        })),
    }),
    {
      name: "geekos-state",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as never))),
      partialize: (s) => ({
        theme: s.theme, scanlines: s.scanlines, matrixBg: s.matrixBg,
        wallpaper: s.wallpaper, sound: s.sound,
        termPrompt: s.termPrompt, termColor: s.termColor,
        iconPositions: s.iconPositions, achievements: s.achievements,
        ctfSolved: s.ctfSolved, ctfScore: s.ctfScore, lessonsDone: s.lessonsDone,
      }),
    }
  )
);
