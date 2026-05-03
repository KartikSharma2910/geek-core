import { useState } from "react";

const LESSONS = [
  {
    cat: "Networking",
    title: "OSI Model in 7 layers",
    body: "Physical, Data Link, Network, Transport, Session, Presentation, Application — the framework that defines how data travels.",
  },
  {
    cat: "Networking",
    title: "TCP vs UDP",
    body: "TCP guarantees delivery via handshakes & retransmission. UDP is fire-and-forget — fast but unreliable.",
  },
  {
    cat: "Linux",
    title: "Essential commands",
    body: "ls, cd, grep, awk, sed, find, chmod, chown, ps, top, kill — your daily toolkit.",
  },
  {
    cat: "Linux",
    title: "Permissions",
    body: "rwx for owner/group/others. Use chmod 755 for executables, 644 for files.",
  },
  {
    cat: "Security",
    title: "Defense in depth",
    body: "Layer firewalls, encryption, MFA, monitoring — assume any single layer can fail.",
  },
  {
    cat: "Security",
    title: "OWASP Top 10",
    body: "Injection, broken auth, XSS, IDOR, misconfigurations — the recurring suspects.",
  },
];

import { useOS } from "../store";

export function LearningHub() {
  const { lessonsDone, toggleLesson } = useOS();
  const done = new Set(lessonsDone);
  const cats = Array.from(new Set(LESSONS.map((l) => l.cat)));
  const [cat, setCat] = useState(cats[0]);
  const inCat = LESSONS.filter((l) => l.cat === cat);
  const progress = Math.round((done.size / LESSONS.length) * 100);

  return (
    <div className="grid grid-cols-[140px_1fr] h-full text-xs">
      <aside className="border-r border-[var(--neon)]/20 p-2 space-y-1 bg-black/30">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`block w-full text-left px-2 py-1.5 rounded ${c === cat ? "bg-[var(--neon)]/20 neon-text" : "hover:bg-[var(--neon)]/10"}`}
          >
            {c}
          </button>
        ))}
        <div className="mt-4 px-2">
          <div className="text-[10px] opacity-60 mb-1">Progress {progress}%</div>
          <div className="h-1.5 bg-[var(--neon)]/15 rounded">
            <div className="h-full bg-[var(--neon)] rounded" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>
      <main className="p-4 space-y-3 overflow-auto">
        {inCat.map((l) => (
          <article key={l.title} className="neon-border rounded p-3 bg-black/30">
            <div className="flex justify-between items-start gap-2">
              <h4 className="neon-text">{l.title}</h4>
              <button
                onClick={() => toggleLesson(l.title)}
                className={`text-[10px] px-2 py-0.5 rounded neon-border ${done.has(l.title) ? "bg-[var(--neon)]/30" : ""}`}
              >
                {done.has(l.title) ? "✓ done" : "mark"}
              </button>
            </div>
            <p className="opacity-80 mt-2">{l.body}</p>
          </article>
        ))}
      </main>
    </div>
  );
}
