import { useState } from "react";
import { useOS } from "../store";
import { sfx } from "../sound";

interface LabModule {
  id: string;
  title: string;
  desc: string;
  hint: string;
  check: (input: string) => boolean;
  safe: string;
}

const MODULES: LabModule[] = [
  {
    id: "sqli", title: "SQL Injection",
    desc: "Bypass the login: SELECT * FROM users WHERE name='INPUT' AND pw='x'",
    hint: "Classic: ' OR '1'='1' --",
    check: (i) => /'\s*or\s*'?1'?\s*=\s*'?1/i.test(i),
    safe: "Use parameterized queries / prepared statements. Never concatenate user input.",
  },
  {
    id: "xss", title: "Cross-Site Scripting",
    desc: "Inject a payload that runs JS on the page.",
    hint: "<script>alert(1)</script> or <img src=x onerror=alert(1)>",
    check: (i) => /<script[\s\S]*?>|on\w+\s*=/i.test(i),
    safe: "Escape HTML output. Use a strict CSP. Sanitize with DOMPurify.",
  },
  {
    id: "csrf", title: "CSRF",
    desc: "Forge a request that transfers funds. What HTML element auto-submits cross-site?",
    hint: "A form with method=POST that auto-submits via JavaScript.",
    check: (i) => /<form[^>]+action=[^>]+>[\s\S]*<\/form>/i.test(i) && /method\s*=\s*["']?post/i.test(i),
    safe: "Use SameSite=Strict cookies and anti-CSRF tokens validated server-side.",
  },
  {
    id: "path", title: "Path Traversal",
    desc: "App reads ./public/INPUT — read /etc/passwd.",
    hint: "../../../../etc/passwd",
    check: (i) => /(\.\.[\\/]){2,}.*etc[\\/]passwd/i.test(i),
    safe: "Resolve paths and enforce they remain inside the allowed root. Reject '..'.",
  },
  {
    id: "jwt", title: "JWT none-alg",
    desc: "Forge a token with header alg=none and payload {\"role\":\"admin\"}. (Paste compact JWT)",
    hint: "Base64url('{\"alg\":\"none\"}') + '.' + Base64url('{\"role\":\"admin\"}') + '.'",
    check: (i) => {
      const parts = i.trim().split(".");
      if (parts.length !== 3 || parts[2] !== "") return false;
      try {
        const dec = (s: string) => atob(s.replace(/-/g, "+").replace(/_/g, "/"));
        const h = JSON.parse(dec(parts[0]));
        const p = JSON.parse(dec(parts[1]));
        return /^none$/i.test(h.alg) && p.role === "admin";
      } catch { return false; }
    },
    safe: "Reject 'none' algorithm. Pin allowed algs server-side and verify signatures.",
  },
  {
    id: "cmdi", title: "Command Injection",
    desc: "App runs: ping -c1 INPUT — also list directory contents.",
    hint: "8.8.8.8; ls -la   (or && / | )",
    check: (i) => /(;|&&|\|\|?|`|\$\()\s*(ls|cat|whoami|id)/i.test(i),
    safe: "Never pass user input to shell. Use exec with argv array, allowlist values.",
  },
];

export function CyberLab() {
  const { unlock } = useOS();
  const [active, setActive] = useState<LabModule>(MODULES[0]);
  const [input, setInput] = useState("");
  const passed = active.check(input);

  if (passed) {
    unlock(active.id);
    sfx.achievement;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] h-full text-xs">
      <aside className="border-b sm:border-b-0 sm:border-r border-[var(--neon)]/20 p-2 sm:space-y-1 bg-black/30 flex sm:block overflow-x-auto">
        {MODULES.map((m) => (
          <button key={m.id}
            onClick={() => { setActive(m); setInput(""); sfx.click(); }}
            className={`block whitespace-nowrap text-left px-2 py-1.5 rounded ${active.id === m.id ? "bg-[var(--neon)]/20 neon-text" : "hover:bg-[var(--neon)]/10"}`}>
            {m.title}
          </button>
        ))}
      </aside>
      <main className="p-4 space-y-3 overflow-auto">
        <h3 className="neon-text text-sm">{active.title}</h3>
        <p className="opacity-80">{active.desc}</p>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          rows={3} placeholder="your payload..."
          className="w-full bg-black/50 neon-border rounded px-2 py-1.5 font-mono" />
        <div className={`p-2 rounded neon-border ${passed ? "bg-[var(--neon)]/15" : "bg-black/30"}`}>
          {passed ? "✓ Exploit detected — sandbox triggered. Achievement unlocked." : "› awaiting payload..."}
        </div>
        <div className="opacity-70">
          <div className="text-[10px] uppercase tracking-widest opacity-60">Hint</div>
          <code className="font-mono break-all">{active.hint}</code>
        </div>
        <div className="border-t border-[var(--neon)]/20 pt-2">
          <div className="text-[10px] uppercase opacity-60 mb-1">Defense</div>
          <p>{active.safe}</p>
        </div>
        <p className="text-[10px] opacity-50">Sandboxed simulation — no real requests are sent.</p>
      </main>
    </div>
  );
}
