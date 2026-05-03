import { useOS } from "../store";

interface Achievement {
  id: string;
  title: string;
  desc: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-ai", title: "Hello, NYX", desc: "Talk to the AI assistant for the first time." },
  { id: "scanner", title: "Recon Initiate", desc: "Run a port scan in the terminal." },
  { id: "sqli", title: "Injector", desc: "Solve the SQL Injection lab." },
  { id: "xss", title: "Script Kiddie", desc: "Trigger an XSS payload in the lab." },
  { id: "csrf", title: "Forged Identity", desc: "Complete the CSRF lab." },
  { id: "jwt", title: "Token Tamperer", desc: "Forge a none-alg JWT." },
  { id: "path", title: "Path Wanderer", desc: "Escape the chroot in path-traversal lab." },
  { id: "cmdi", title: "Shell Whisperer", desc: "Chain a command-injection payload." },
  { id: "ctf-3", title: "Flag Hunter", desc: "Capture 3 CTF flags." },
  { id: "wifi", title: "Aircrack Apprentice", desc: "Crack a WiFi handshake." },
];

export function Achievements() {
  const { achievements, ctfScore } = useOS();
  const unlocked = new Set(achievements);
  const pct = Math.round((unlocked.size / ACHIEVEMENTS.length) * 100);
  return (
    <div className="p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between neon-border rounded p-3 bg-black/30">
        <div>
          <div className="text-xs opacity-70">PROGRESS</div>
          <div className="neon-text text-xl">
            {unlocked.size} / {ACHIEVEMENTS.length}
          </div>
        </div>
        <div>
          <div className="text-xs opacity-70 text-right">CTF SCORE</div>
          <div className="neon-text text-xl text-right">{ctfScore}</div>
        </div>
      </div>
      <div className="h-1.5 bg-[var(--neon)]/15 rounded overflow-hidden">
        <div
          className="h-full bg-[var(--neon)]"
          style={{ width: `${pct}%`, boxShadow: "0 0 10px var(--neon)" }}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              className={`neon-border rounded p-3 ${got ? "bg-[var(--neon)]/10" : "bg-black/30 opacity-60"}`}
            >
              <div className="flex justify-between items-start">
                <div className={got ? "neon-text" : ""}>
                  {got ? "🏆 " : "🔒 "}
                  {a.title}
                </div>
                <span className="text-[10px] opacity-60">{got ? "UNLOCKED" : "LOCKED"}</span>
              </div>
              <p className="text-xs opacity-80 mt-1">{a.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
