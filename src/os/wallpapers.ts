import type { CSSProperties } from "react";
import type { Wallpaper } from "./store";

type WP = { label: string; style: CSSProperties };

export const WALLPAPERS: Record<Wallpaper, WP> = {
  matrix: {
    label: "Matrix Rain",
    style: {
      backgroundColor: "oklch(0.08 0.02 160)",
      backgroundImage:
        "radial-gradient(ellipse at top, oklch(0.22 0.08 160 / 0.9) 0%, transparent 60%)," +
        "radial-gradient(ellipse at bottom, oklch(0.05 0.01 160) 0%, transparent 70%)",
    },
  },
  circuit: {
    label: "Abstract Circuit",
    style: {
      backgroundColor: "oklch(0.09 0.02 200)",
      backgroundImage:
        "linear-gradient(color-mix(in oklab, var(--neon) 22%, transparent) 1px, transparent 1px)," +
        "linear-gradient(90deg, color-mix(in oklab, var(--neon) 22%, transparent) 1px, transparent 1px)," +
        "linear-gradient(color-mix(in oklab, var(--neon) 8%, transparent) 1px, transparent 1px)," +
        "linear-gradient(90deg, color-mix(in oklab, var(--neon) 8%, transparent) 1px, transparent 1px)," +
        "radial-gradient(circle at 25% 30%, color-mix(in oklab, var(--neon) 35%, transparent), transparent 45%)," +
        "radial-gradient(circle at 75% 75%, oklch(0.4 0.2 305 / 0.5), transparent 55%)",
      backgroundSize: "80px 80px, 80px 80px, 16px 16px, 16px 16px, 100% 100%, 100% 100%",
    },
  },
  grid: {
    label: "Neon Grid",
    style: {
      backgroundColor: "oklch(0.06 0.02 280)",
      backgroundImage:
        "linear-gradient(color-mix(in oklab, var(--neon) 30%, transparent) 1px, transparent 1px)," +
        "linear-gradient(90deg, color-mix(in oklab, var(--neon) 30%, transparent) 1px, transparent 1px)," +
        "radial-gradient(ellipse at 50% 100%, color-mix(in oklab, var(--neon) 50%, transparent), transparent 60%)",
      backgroundSize: "60px 60px, 60px 60px, 100% 100%",
      backgroundPosition: "center bottom",
    },
  },
  nebula: {
    label: "Cyber Nebula",
    style: {
      backgroundColor: "oklch(0.06 0.02 280)",
      backgroundImage:
        "radial-gradient(ellipse at 20% 30%, oklch(0.45 0.25 305 / 0.7), transparent 55%)," +
        "radial-gradient(ellipse at 80% 70%, oklch(0.45 0.22 200 / 0.6), transparent 55%)," +
        "radial-gradient(ellipse at 50% 90%, oklch(0.40 0.22 25 / 0.45), transparent 60%)," +
        "radial-gradient(ellipse at 60% 10%, oklch(0.40 0.22 150 / 0.35), transparent 55%)",
    },
  },
  void: {
    label: "Deep Void",
    style: {
      backgroundColor: "#000",
      backgroundImage:
        "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--neon) 18%, transparent), transparent 35%)," +
        "radial-gradient(circle at 80% 80%, color-mix(in oklab, var(--neon) 12%, transparent), transparent 40%)",
    },
  },
};
