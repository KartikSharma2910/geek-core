# 🖥️ Geek OS — A Cyberpunk Web Operating System

> An interactive, browser-based "operating system" packed with hacking-themed apps, AI assistants, real cybersecurity labs, and a procedurally animated retro-futuristic UI.

![status](https://img.shields.io/badge/status-active-00ff88) ![stack](https://img.shields.io/badge/stack-TanStack%20Start-9333ea) ![ai](https://img.shields.io/badge/AI-Lovable%20Gateway-00d9ff)

---

## ✨ Overview

**Geek OS** is a fully self-contained desktop environment that runs entirely in the browser. It simulates a neon, terminal-driven OS with draggable windows, a taskbar, a start menu, persistent settings, achievements, and a dozen cybersecurity-flavored mini-apps. It is built on **TanStack Start v1** (React 19 + Vite 7), styled with **Tailwind CSS v4**, and powered by **Lovable AI Gateway** for in-OS AI capabilities.

---

## 🧱 Tech Stack

| Layer            | Technology                                                  |
| ---------------- | ----------------------------------------------------------- |
| Framework        | TanStack Start v1 (React 19, file-based routing, SSR)       |
| Build tool       | Vite 7 (`@lovable.dev/vite-tanstack-config`)                |
| Styling          | Tailwind CSS v4 (native CSS imports, `oklch` design tokens) |
| State management | Zustand 5 (with `persist` → localStorage)                   |
| UI primitives    | shadcn/ui + Radix UI                                        |
| Icons            | lucide-react                                                |
| AI               | Lovable AI Gateway → `google/gemini-2.5-flash`              |
| API routes       | TanStack Start server routes                                |
| Runtime target   | Vercel (Nitro `vercel` preset)                              |
| Forms / schemas  | react-hook-form + zod                                       |

---

## 🏗️ Architecture

```
src/
├── routes/
│   ├── __root.tsx           # Root shell (head, html/body, providers)
│   └── index.tsx            # Mounts <Boot /> then <Desktop />
├── os/
│   ├── Boot.tsx             # Animated POST/boot sequence
│   ├── Desktop.tsx          # Wallpaper, icons, taskbar, start menu, personalize
│   ├── Window.tsx           # Draggable/resizable/min/max window manager
│   ├── MatrixRain.tsx       # Live wallpaper canvas
│   ├── store.ts             # Zustand store + persistence
│   ├── sound.ts             # Procedural WebAudio SFX
│   ├── wallpapers.ts        # 5 wallpaper presets
│   └── apps/                # All bundled OS apps
│       ├── Terminal.tsx          # Shell + AI assistant (NYX)
│       ├── SystemMonitor.tsx     # FPS / memory / network live charts
│       ├── PasswordAnalyzer.tsx  # Entropy + crack-time estimator
│       ├── NetworkVisualizer.tsx # Animated topology graph
│       ├── ApiInspector.tsx      # Lightweight Postman-style client
│       ├── CyberLab.tsx          # CSRF / JWT / SQLi / XSS labs
│       ├── LearningHub.tsx       # Lessons + progress
│       ├── Challenges.tsx        # CTF flags + scoring
│       ├── WifiCracker.tsx       # Simulated WPA handshake demo
│       ├── Achievements.tsx      # Unlock viewer
│       ├── Vpn.tsx               # IP intel + simulated tunnel
│       ├── Settings.tsx          # Theme, prompt, color, toggles
│       └── About.tsx
├── routes/
│   └── api.ai.ts            # POST /api/ai → Lovable AI Gateway
├── components/ui/           # shadcn/ui primitives
└── styles.css               # Design tokens + glitch/scanline animations
```

### State model (Zustand)

```ts
{
  // Window manager
  windows: WindowState[]; topZ; open(); close(); focus(); move(); resize();
  toggleMin(); toggleMax();

  // Theme & visuals  (persisted)
  theme: "green" | "purple" | "red" | "amber" | "ice";
  wallpaper: "matrix" | "circuit" | "grid" | "nebula" | "void";
  scanlines, matrixBg, sound: boolean;
  termPrompt, termColor: string;

  // Progress  (persisted)
  iconPositions, achievements, ctfSolved, ctfScore, lessonsDone;
}
```

Persisted under the `geekos-state` key in `localStorage` via `zustand/middleware`.

### Server API

`src/routes/api.ai.ts` exposes `POST /api/ai` — a server route that proxies to the **Lovable AI Gateway** with `LOVABLE_API_KEY` (server-only). The Terminal app calls this route with `fetch`; no keys are ever bundled into the client.

---

## 🎮 Features

### Desktop environment
- ✅ Draggable, resizable, minimizable, maximizable windows with z-index focus
- ✅ Draggable desktop icons (positions persisted)
- ✅ Right-click context menu (Open Terminal, Personalize, Change wallpaper, Reboot…)
- ✅ Start menu with live app search
- ✅ Taskbar with running-app tray, network/battery/clock indicators
- ✅ Personalization slide-out: wallpapers, scanlines, matrix rain, sound
- ✅ Double-click desktop to cycle wallpapers (with toast)
- ✅ 5 themes (`green`, `purple`, `red`, `amber`, `ice`) + 5 wallpapers
- ✅ CRT scanlines, glitch bars, flicker overlays, neon pulse glow
- ✅ Procedural WebAudio SFX (open / click / error)
- ✅ Boot/POST animation on first load
- ✅ Mobile responsive (auto-maximizes windows on small viewports)

### Bundled apps
| App                    | What it does                                                             |
| ---------------------- | ------------------------------------------------------------------------ |
| **Terminal**           | Real shell-style commands + `ai <prompt>` powered by Gemini 2.5 Flash    |
| **System Monitor**     | Live FPS, memory (`performance.memory`), network type, uptime           |
| **Password Analyzer**  | Shannon entropy, charset analysis, brute-force time estimate            |
| **Network Visualizer** | Animated force-graph of nodes + packet flow                             |
| **API Inspector**      | Postman-lite: methods, headers, body, response viewer                   |
| **Cyber Lab**          | Hands-on labs for CSRF, JWT (none alg), SQLi, XSS, hashing              |
| **Learning Hub**       | Bite-size cybersecurity lessons with progress tracking                  |
| **CTF Challenges**     | Capture-the-flag puzzles, scoring, and solved-state persistence         |
| **WiFi Cracker**       | Simulated WPA handshake + dictionary attack visualizer                  |
| **VPN Shield**         | Real public IP / city / ISP / ASN via `ipapi.co` + simulated tunnel     |
| **Achievements**       | Unlock viewer for milestones                                            |
| **Settings**           | Theme switcher, prompt customizer, sound, scanlines, matrix toggle      |
| **About**              | Project metadata                                                        |

---

## 🚀 Getting Started

```bash
# Install
bun install     # or: npm install

# Dev server (hot reload)
bun dev         # → http://localhost:8080

# Production build
bun run build

# Preview the production build locally
bun run preview
```

### Environment variables

| Variable           | Where           | Required for |
| ------------------ | --------------- | ------------ |
| `LOVABLE_API_KEY`  | server-only     | Terminal AI command (`ai`), NYX assistant |

Set it in **Lovable → Cloud → Secrets** (auto-injected at runtime). Never prefix with `VITE_` — that would expose it to the client bundle.

---

## ☁️ Deployment

### Vercel

This repository is configured for Vercel using Nitro's `vercel` preset. `vite.config.ts` disables the Cloudflare build plugin and emits Vercel Build Output into `.vercel/output`.

Use these Vercel settings:

| Setting | Value |
| ------- | ----- |
| Framework preset | Other |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | Leave empty / auto-detected |

Add `LOVABLE_API_KEY` in **Vercel → Project → Settings → Environment Variables** without a `VITE_` prefix.

The previous deployment error was the classic **TanStack Start import-protection failure on Vercel**:

```
Move the server-only import out of this file into a separate
.server.ts module that is not imported by any client code
   at Object.handler (.../start-plugin-core/.../import-protection-plugin.js)
Error: Command "npm run build" exited with 1
```

**Why it happened:** the Terminal imported a `createServerFn` module from the client window chain. The fix is to call `POST /api/ai` instead, keeping `process.env.LOVABLE_API_KEY` inside the server route only.

### Lovable Publish
Lovable Publish is still supported for quick previews, but this repository's checked-in configuration is now Vercel-focused.

---

## 🎨 Design System

All colors live in `src/styles.css` as semantic `oklch` tokens — never hard-code colors in components.

```css
:root {
  --neon: oklch(...);
  --neon-glow: oklch(...);
  --bg: oklch(...);
  --gradient-neon: linear-gradient(135deg, var(--neon), var(--neon-glow));
  --shadow-neon: 0 10px 30px -10px color-mix(in oklab, var(--neon) 40%, transparent);
}

.theme-purple { --neon: oklch(...); }
.theme-red    { --neon: oklch(...); }
/* etc. */
```

Animations: `glitch-text`, `glitch-bar`, `flicker`, `pulse-glow`, `scanlines`, `wallpaper-matrix`.

---

## 🔐 Security Notes

- The **Cyber Lab** simulators (CSRF / SQLi / XSS / JWT) operate on synthetic data inside the page — nothing leaves the browser.
- The **WiFi Cracker** is purely educational visualization; it does NOT touch real wireless interfaces.
- **VPN Shield** reads your real public IP from `ipapi.co` for educational display; the "tunnel" is simulated and does NOT route real traffic.
- The AI server function uses a server-only key. Client code can only call it via the typed RPC, never with the raw key.

---

## 🗺️ Roadmap

- [ ] Lovable Cloud auth + cloud-synced settings & CTF leaderboard
- [ ] File Explorer app with virtual filesystem + text editor
- [ ] Music Player with audio visualizer
- [ ] In-OS Browser (iframe-based, with bookmarks)
- [ ] Mobile gestures (swipe to close, long-press menus)
- [ ] Plugin marketplace

---

## 📝 License


