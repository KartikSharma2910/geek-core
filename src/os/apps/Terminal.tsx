import { useEffect, useRef, useState } from "react";
import { useOS, type AppId } from "../store";
import { sfx } from "../sound";

interface Line {
  type: "in" | "out" | "ai" | "err";
  text: string;
}

const HELP = `Available commands:
  help                show this help
  clear               clear the screen
  echo [text]         print text
  whoami              current user
  date                current date/time
  ls / cat [file]     fake filesystem
  system-info         hardware overview (real navigator data)
  simulate-scan       fake nmap-style port scan
  open [app]          launch an app
  prompt [text]       customize prompt
  color [css-color]   change text color
  theme [g|p|r|a|i]   switch theme
  history             show last commands
  ai [prompt]         ask NYX (real AI assistant)`;

const FAKE_FS: Record<string, string> = {
  "readme.md": "# Geek OS\nA cyberpunk operating system in your browser. Type 'help'.",
  "secrets.enc": "U2FsdGVkX1+8x2Vk4kVqZ... [encrypted blob]",
  "kernel.log": "[boot] geek-kernel 4.2.1 loaded\n[net] tunnel up\n[wm] desktop ready",
  ".bash_history": "ls\nsystem-info\nai who are you\nsimulate-scan",
  "neon.cfg": "theme=green\nscanlines=true",
};

async function askNYX(prompt: string) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const payload = (await response.json().catch(() => null)) as {
    content?: string;
    error?: string;
  } | null;
  if (!response.ok || !payload?.content) {
    throw new Error(payload?.error ?? `AI endpoint failed (${response.status})`);
  }

  return payload.content;
}

export function Terminal() {
  const open = useOS((s) => s.open);
  const { termPrompt, termColor, setTermPrompt, setTermColor, setTheme, unlock } = useOS();
  const [lines, setLines] = useState<Line[]>([
    { type: "out", text: "Geek OS Shell [nyx-sh v3.1.4] — type 'help' to begin." },
    { type: "out", text: "Tip: 'ai <prompt>' talks to NYX, your live AI assistant." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [lines]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const print = (text: string, type: Line["type"] = "out") =>
    setLines((l) => [...l, { type, text }]);

  const exec = async (raw: string) => {
    const cmd = raw.trim();
    setLines((l) => [...l, { type: "in", text: raw }]);
    if (cmd) setHistory((h) => [...h, cmd]);
    setHIdx(-1);
    if (!cmd) return;
    const [c, ...args] = cmd.split(/\s+/);
    switch (c) {
      case "help":
        print(HELP);
        break;
      case "clear":
        setLines([]);
        break;
      case "echo":
        print(args.join(" "));
        break;
      case "whoami":
        print("operator");
        break;
      case "date":
        print(new Date().toString());
        break;
      case "ls":
        print(Object.keys(FAKE_FS).join("   "));
        break;
      case "cat": {
        const f = FAKE_FS[args[0]];
        print(f ?? `cat: ${args[0]}: no such file`, f ? "out" : "err");
        break;
      }
      case "history":
        print(history.map((h, i) => `${i + 1}  ${h}`).join("\n"));
        break;
      case "prompt":
        if (args.length) {
          setTermPrompt(args.join(" "));
          print(`prompt updated.`);
        } else print(`current: ${termPrompt}`);
        break;
      case "color":
        if (args[0]) {
          setTermColor(args[0]);
          print(`color set to ${args[0]}`);
        } else print(`current: ${termColor}`);
        break;
      case "theme": {
        const map: Record<string, "green" | "purple" | "red" | "amber" | "ice"> = {
          g: "green",
          p: "purple",
          r: "red",
          a: "amber",
          i: "ice",
        };
        const t = map[args[0]?.[0] ?? ""];
        if (t) {
          setTheme(t);
          print(`theme → ${t}`);
        } else print("usage: theme [g|p|r|a|i]");
        break;
      }
      case "system-info": {
        const nav = navigator as Navigator & {
          deviceMemory?: number;
          connection?: { effectiveType?: string; downlink?: number };
        };
        const cores = nav.hardwareConcurrency ?? "?";
        const mem = nav.deviceMemory ?? "?";
        const conn = nav.connection?.effectiveType ?? "unknown";
        const dl = nav.connection?.downlink ?? "?";
        print(`CPU threads : ${cores}
RAM (approx): ${mem} GB
Platform    : ${navigator.platform}
User agent  : ${navigator.userAgent.slice(0, 80)}
Network     : ${conn} (~${dl} Mbps)
Online      : ${navigator.onLine ? "yes" : "no"}
Geek OS     : 1.0 "Cyberglow"`);
        break;
      }
      case "simulate-scan": {
        const ports = [22, 80, 443, 1337, 31337];
        for (const p of ports) {
          await new Promise((r) => setTimeout(r, 200));
          print(`port ${p.toString().padEnd(5)} ${Math.random() > 0.5 ? "open" : "filtered"}`);
        }
        print("scan complete — 5 ports analyzed.");
        unlock("scanner");
        break;
      }
      case "open": {
        const valid = [
          "terminal",
          "monitor",
          "password",
          "network",
          "api",
          "lab",
          "learn",
          "challenges",
          "wifi",
          "achievements",
          "settings",
          "about",
        ];
        if (valid.includes(args[0])) {
          open(args[0] as AppId);
          print(`launching ${args[0]}...`);
          sfx.open();
        } else print(`unknown app: ${args[0] ?? "(none)"}`, "err");
        break;
      }
      case "ai": {
        if (!args.length) {
          print("usage: ai <prompt>", "err");
          break;
        }
        setBusy(true);
        print("NYX is thinking...", "ai");
        try {
          const content = await askNYX(args.join(" "));
          setLines((l) => [...l.slice(0, -1), { type: "ai", text: `NYX » ${content}` }]);
          unlock("first-ai");
        } catch (e) {
          setLines((l) => [
            ...l.slice(0, -1),
            { type: "err", text: `NYX offline: ${(e as Error).message}` },
          ]);
        } finally {
          setBusy(false);
        }
        break;
      }
      default:
        print(`command not found: ${c}. try 'help'.`, "err");
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sfx.key();
    if (e.key === "Enter") {
      exec(input);
      setInput("");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const ni = hIdx < 0 ? history.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(ni);
      setInput(history[ni] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx < 0) return;
      const ni = hIdx + 1;
      if (ni >= history.length) {
        setHIdx(-1);
        setInput("");
      } else {
        setHIdx(ni);
        setInput(history[ni]);
      }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const cmds = [
        "help",
        "clear",
        "echo",
        "whoami",
        "date",
        "ls",
        "cat",
        "history",
        "prompt",
        "color",
        "theme",
        "system-info",
        "simulate-scan",
        "open",
        "ai",
      ];
      const m = cmds.find((x) => x.startsWith(input));
      if (m) setInput(m);
    }
  };

  return (
    <div
      className="h-full bg-black/85 p-3 font-mono text-xs leading-relaxed"
      style={{ color: termColor }}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap break-words">
          {l.type === "in" ? (
            <>
              <span className="opacity-60">{termPrompt}</span> {l.text}
            </>
          ) : l.type === "err" ? (
            <span className="text-red-400">{l.text}</span>
          ) : l.type === "ai" ? (
            <span className="text-cyan-300">{l.text}</span>
          ) : (
            <span className="opacity-90">{l.text}</span>
          )}
        </div>
      ))}
      <div className="flex items-center gap-1">
        <span className="opacity-60">{termPrompt}</span>
        <input
          ref={inputRef}
          value={input}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          className="flex-1 bg-transparent outline-none caret-current"
          autoFocus
          aria-label="terminal input"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}
