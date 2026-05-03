import { useState } from "react";
import { useOS } from "../store";
import { sfx } from "../sound";

interface Stage {
  prompt: string;
  answer: string | RegExp;
}
interface Flag {
  id: string;
  title: string;
  category: string;
  points: number;
  stages: Stage[];
  final: string;
}

const FLAGS: Flag[] = [
  {
    id: "b64",
    title: "Hidden in plain sight",
    category: "Crypto",
    points: 100,
    stages: [
      { prompt: "Decode base64: Z2Vla3s0X3RoMHVzNG5kX2V5M3N9", answer: "geek{4_th0us4nd_ey3s}" },
    ],
    final: "geek{4_th0us4nd_ey3s}",
  },
  {
    id: "caesar",
    title: "Caesar's whisper",
    category: "Crypto",
    points: 150,
    stages: [{ prompt: "Shift 3 backward: jhhn{fubcwr_lf_ihq}", answer: "geek{crypto_is_fun}" }],
    final: "geek{crypto_is_fun}",
  },
  {
    id: "rev",
    title: "Reverse it",
    category: "Misc",
    points: 100,
    stages: [{ prompt: "}gn1k4h_d00g{keeg", answer: "geek{good_h4k1ng}" }],
    final: "geek{good_h4k1ng}",
  },
  {
    id: "multi",
    title: "Multi-stage: Recon → Decode",
    category: "Web",
    points: 300,
    stages: [
      {
        prompt:
          "Stage 1 — A backup file is exposed at /backup.txt. What is the filename you would request to find admin notes? (one word, no slash)",
        answer: /^admin(\.bak|\.txt|_notes(\.txt)?)$/i,
      },
      {
        prompt:
          "Stage 2 — Inside admin.bak you find: 'Z2Vla3ttdWx0aV9zdGFnZV93MW5ffQ=='. Submit the decoded flag.",
        answer: "geek{multi_stage_w1n_}",
      },
    ],
    final: "geek{multi_stage_w1n_}",
  },
  {
    id: "file",
    title: "File magic",
    category: "Forensics",
    points: 200,
    stages: [
      {
        prompt:
          "PNG files start with hex 89 50 4E 47. What 4-letter ASCII string follows the 0x89 byte?",
        answer: /^png$/i,
      },
    ],
    final: "geek{magic_bytes}",
  },
  {
    id: "net",
    title: "Network puzzle",
    category: "Networking",
    points: 250,
    stages: [
      {
        prompt: "Stage 1 — TCP three-way handshake: SYN → ? → ACK. What goes in the middle?",
        answer: /^syn[- ]?ack$/i,
      },
      { prompt: "Stage 2 — A web server commonly listens on port?", answer: /^(80|443)$/ },
    ],
    final: "geek{handshake_master}",
  },
];

export function Challenges() {
  const { ctfSolved, markCtf, addScore, unlock, ctfScore } = useOS();
  const [active, setActive] = useState<Flag>(FLAGS[0]);
  const [stage, setStage] = useState(0);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");

  const isSolved = ctfSolved.includes(active.id);

  const submit = () => {
    const a = active.stages[stage].answer;
    const ok =
      typeof a === "string" ? input.trim().toLowerCase() === a.toLowerCase() : a.test(input.trim());
    if (!ok) {
      setMsg("✗ nope, keep trying.");
      sfx.error();
      return;
    }
    if (stage + 1 < active.stages.length) {
      setStage(stage + 1);
      setInput("");
      setMsg("✓ stage cleared, next!");
      return;
    }
    if (!isSolved) {
      markCtf(active.id);
      addScore(active.points);
      sfx.achievement;
      const total = ctfSolved.length + 1;
      if (total >= 3) unlock("ctf-3");
    }
    setMsg(`✓ flag captured: ${active.final}`);
  };

  const select = (f: Flag) => {
    setActive(f);
    setStage(0);
    setInput("");
    setMsg("");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] h-full text-xs">
      <aside className="border-b sm:border-b-0 sm:border-r border-[var(--neon)]/20 p-2 bg-black/30 overflow-auto">
        <div className="px-2 py-1 mb-2 neon-border rounded bg-black/40">
          <div className="text-[10px] opacity-60">SCORE</div>
          <div className="neon-text text-lg">{ctfScore}</div>
        </div>
        {FLAGS.map((f) => (
          <button
            key={f.id}
            onClick={() => select(f)}
            className={`block w-full text-left px-2 py-1.5 rounded ${active.id === f.id ? "bg-[var(--neon)]/20" : "hover:bg-[var(--neon)]/10"}`}
          >
            <div className={ctfSolved.includes(f.id) ? "neon-text" : ""}>
              {ctfSolved.includes(f.id) ? "✓ " : "› "}
              {f.title}
            </div>
            <div className="text-[10px] opacity-60">
              {f.category} · {f.points} pts {f.stages.length > 1 && `· ${f.stages.length} stages`}
            </div>
          </button>
        ))}
      </aside>
      <main className="p-4 space-y-3 overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="neon-text">{active.title}</h3>
          <span className="text-[10px] opacity-60">
            stage {stage + 1}/{active.stages.length}
          </span>
        </div>
        <pre className="neon-border rounded p-3 bg-black/40 whitespace-pre-wrap break-all">
          {active.stages[stage].prompt}
        </pre>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="answer..."
            className="flex-1 bg-black/50 neon-border rounded px-2 py-1.5 font-mono"
          />
          <button
            onClick={submit}
            className="px-3 neon-border rounded neon-text hover:bg-[var(--neon)]/15"
          >
            SUBMIT
          </button>
        </div>
        {msg && <div className="opacity-90">{msg}</div>}
      </main>
    </div>
  );
}
