import { useEffect, useRef, type ReactNode } from "react";
import { useOS, type WindowState } from "./store";
import { sfx } from "./sound";
import { X, Minus, Square } from "lucide-react";

export function Window({ win, children }: { win: WindowState; children: ReactNode }) {
  const { focus, close, move, resize, toggleMin, toggleMax } = useOS();
  const dragRef = useRef<{ ox: number; oy: number; mx: number; my: number } | null>(null);
  const resizeRef = useRef<{ ow: number; oh: number; mx: number; my: number } | null>(null);

  useEffect(() => {
    sfx.open();
  }, []);
  if (win.minimized) return null;

  const onDragStart = (e: React.MouseEvent) => {
    if (win.maximized) return;
    focus(win.id);
    dragRef.current = { ox: win.x, oy: win.y, mx: e.clientX, my: e.clientY };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const d = dragRef.current;
      move(win.id, Math.max(0, d.ox + ev.clientX - d.mx), Math.max(0, d.oy + ev.clientY - d.my));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (win.maximized) return;
    focus(win.id);
    resizeRef.current = { ow: win.w, oh: win.h, mx: e.clientX, my: e.clientY };
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const r = resizeRef.current;
      resize(
        win.id,
        Math.max(360, r.ow + ev.clientX - r.mx),
        Math.max(220, r.oh + ev.clientY - r.my),
      );
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const style: React.CSSProperties = win.maximized
    ? { left: 8, top: 8, width: "calc(100vw - 16px)", height: "calc(100vh - 70px)", zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <div
      style={style}
      className="absolute glass-strong neon-border rounded-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      onMouseDown={() => focus(win.id)}
    >
      <div
        onMouseDown={onDragStart}
        onDoubleClick={() => toggleMax(win.id)}
        className="h-8 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b border-[var(--neon)]/25 bg-[var(--neon)]/5 select-none"
      >
        <div className="flex items-center gap-2 text-xs neon-text tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)]" />
          {win.title}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleMin(win.id)}
            className="h-5 w-5 grid place-items-center hover:bg-[var(--neon)]/20 rounded"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            onClick={() => toggleMax(win.id)}
            className="h-5 w-5 grid place-items-center hover:bg-[var(--neon)]/20 rounded"
          >
            <Square className="h-3 w-3" />
          </button>
          <button
            onClick={() => {
              sfx.close();
              close(win.id);
            }}
            className="h-5 w-5 grid place-items-center hover:bg-destructive/40 rounded"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
      {!win.maximized && (
        <div
          onMouseDown={onResizeStart}
          className="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize"
          style={{ background: "linear-gradient(135deg, transparent 50%, var(--neon) 50%)" }}
        />
      )}
    </div>
  );
}
