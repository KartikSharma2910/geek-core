import { useEffect, useRef, useState } from "react";
import { useOS } from "../store";
import { Wifi, WifiOff, Lock, Unlock, Radio, Play, Square } from "lucide-react";

interface Net {
  bssid: string;
  essid: string;
  channel: number;
  signal: number; // dBm (negative)
  enc: "WPA2" | "WPA3" | "WEP" | "OPEN";
  clients: number;
  handshake: boolean;
  cracked?: string;
}

const ESSIDS = [
  "HomeNet_5G",
  "CoffeeShop_Free",
  "FBI_Surveillance_Van",
  "NETGEAR_42",
  "DIRECT-roku-882",
  "xfinitywifi",
  "Pretty_Fly_4_WiFi",
  "TellMyWiFiLoveHer",
  "VM-3F8A1",
  "iotcam-7c",
  "TP-Link_2C4F",
  "starbucks-guest",
  "linksys",
  "AndroidAP_9921",
  "neonlab-internal",
];
const WORDLIST = [
  "12345678",
  "password",
  "qwerty123",
  "letmein!",
  "admin123",
  "summer2024",
  "iloveyou",
  "monkey99",
  "dragon77",
  "ninja2k",
  "neon4ever",
  "operator",
  "hacktheplanet",
  "trustno1",
  "cyber2025",
];

function randBSSID() {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase(),
  ).join(":");
}

function genNetworks(n = 12): Net[] {
  const used = new Set<string>();
  return Array.from({ length: n }, () => {
    let essid = ESSIDS[Math.floor(Math.random() * ESSIDS.length)];
    while (used.has(essid))
      essid =
        ESSIDS[Math.floor(Math.random() * ESSIDS.length)] + "_" + Math.floor(Math.random() * 99);
    used.add(essid);
    const enc: Net["enc"] = (["WPA2", "WPA2", "WPA2", "WPA3", "WEP", "OPEN"] as const)[
      Math.floor(Math.random() * 6)
    ];
    return {
      bssid: randBSSID(),
      essid,
      channel: 1 + Math.floor(Math.random() * 11),
      signal: -(35 + Math.floor(Math.random() * 55)),
      enc,
      clients: Math.floor(Math.random() * 8),
      handshake: false,
    };
  });
}

export function WifiCracker() {
  const [scanning, setScanning] = useState(false);
  const [nets, setNets] = useState<Net[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([
    "airmon-ng start wlan0",
    "monitor mode enabled on wlan0mon",
  ]);
  const [cracking, setCracking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tries, setTries] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    logRef.current?.scrollTo({ top: 9e9 });
  }, [logs]);

  const log = (s: string) => setLogs((l) => [...l.slice(-200), s]);

  // live scan: jitter signal + occasional new networks
  useEffect(() => {
    if (!scanning) return;
    const init = setTimeout(() => {
      const initial = genNetworks(8);
      setNets(initial);
      log(`scan started — found ${initial.length} networks on 2.4GHz band`);
    }, 400);
    const t = setInterval(() => {
      setNets((prev) => {
        const next = prev.map((n) => ({
          ...n,
          signal: Math.max(-95, Math.min(-30, n.signal + (Math.random() - 0.5) * 6)),
          clients: Math.max(
            0,
            n.clients + (Math.random() < 0.1 ? (Math.random() < 0.5 ? -1 : 1) : 0),
          ),
        }));
        if (Math.random() < 0.12 && next.length < 16) {
          const fresh = genNetworks(1)[0];
          log(`+ new BSSID ${fresh.bssid}  ESSID="${fresh.essid}"`);
          return [...next, fresh];
        }
        return next;
      });
    }, 1200);
    return () => {
      clearTimeout(init);
      clearInterval(t);
    };
  }, [scanning]);

  const target = nets.find((n) => n.bssid === selected) ?? null;

  const captureHandshake = async () => {
    if (!target) return;
    log(`airodump-ng -c ${target.channel} --bssid ${target.bssid} -w capture wlan0mon`);
    log(`listening on channel ${target.channel}...`);
    for (let i = 0; i < 4; i++) {
      await new Promise((r) => setTimeout(r, 500));
      log(
        `  [${new Date().toLocaleTimeString()}] beacon ${1 + Math.floor(Math.random() * 200)} CH:${target.channel} PWR:${target.signal}`,
      );
    }
    log(`aireplay-ng --deauth 5 -a ${target.bssid} wlan0mon`);
    await new Promise((r) => setTimeout(r, 700));
    log(`>> WPA handshake captured for ${target.essid}`);
    setNets((p) => p.map((n) => (n.bssid === target.bssid ? { ...n, handshake: true } : n)));
  };

  const crack = async () => {
    if (!target || !target.handshake) {
      log("! capture a handshake first");
      return;
    }
    setCracking(true);
    stopRef.current = false;
    setProgress(0);
    setTries(0);
    log(`aircrack-ng -w wordlist.txt -b ${target.bssid} capture-01.cap`);
    // simulated dictionary attack
    const found = Math.random() < 0.7;
    const total = 800 + Math.floor(Math.random() * 1200);
    const hitAt = found ? Math.floor(total * (0.4 + Math.random() * 0.5)) : total;
    let attempted = 0;
    const startedAt = performance.now();
    while (attempted < total) {
      if (stopRef.current) {
        log("! aborted by operator");
        break;
      }
      const step = 25 + Math.floor(Math.random() * 60);
      attempted = Math.min(total, attempted + step);
      const guess =
        WORDLIST[Math.floor(Math.random() * WORDLIST.length)] + Math.floor(Math.random() * 999);
      setTries(attempted);
      setProgress(Math.round((attempted / total) * 100));
      if (attempted % 200 < step) log(`  trying: ${guess}`);
      if (attempted >= hitAt && found) {
        const key = WORDLIST[Math.floor(Math.random() * WORDLIST.length)];
        log(`>> KEY FOUND! [ ${key} ]`);
        log(
          `time: ${((performance.now() - startedAt) / 1000).toFixed(1)}s · keys/s ≈ ${Math.round(attempted / ((performance.now() - startedAt) / 1000))}`,
        );
        setNets((p) => p.map((n) => (n.bssid === target.bssid ? { ...n, cracked: key } : n)));
        useOS.getState().unlock("wifi");
        break;
      }
      await new Promise((r) => setTimeout(r, 90));
    }
    if (!found && !stopRef.current) log("× wordlist exhausted — passphrase not in dictionary");
    setCracking(false);
  };

  return (
    <div className="grid grid-cols-[1fr_320px] h-full text-xs">
      <section className="flex flex-col border-r border-[var(--neon)]/20">
        <div className="flex items-center gap-2 p-2 border-b border-[var(--neon)]/20 bg-black/30">
          <button
            onClick={() => {
              setScanning((s) => !s);
              if (!scanning) log("airodump-ng wlan0mon");
              else log("scan stopped");
            }}
            className="px-2 py-1 neon-border rounded hover:bg-[var(--neon)]/15 flex items-center gap-1 neon-text"
          >
            {scanning ? (
              <>
                <Square className="h-3 w-3" /> STOP
              </>
            ) : (
              <>
                <Play className="h-3 w-3" /> SCAN
              </>
            )}
          </button>
          <span className="opacity-60">iface: wlan0mon · band: 2.4GHz · {nets.length} APs</span>
          {scanning && (
            <span className="ml-auto h-2 w-2 rounded-full bg-[var(--neon)] pulse-glow" />
          )}
        </div>
        <div className="overflow-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-black/70">
              <tr className="text-[10px] uppercase opacity-60">
                <th className="text-left p-1.5">BSSID</th>
                <th className="text-left">ESSID</th>
                <th>CH</th>
                <th>PWR</th>
                <th>ENC</th>
                <th>CL</th>
                <th>HS</th>
              </tr>
            </thead>
            <tbody>
              {nets.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center opacity-50">
                    {scanning ? "scanning..." : "press SCAN to begin"}
                  </td>
                </tr>
              )}
              {nets
                .sort((a, b) => b.signal - a.signal)
                .map((n) => {
                  const bars =
                    n.signal > -55 ? "▮▮▮▮" : n.signal > -70 ? "▮▮▮" : n.signal > -82 ? "▮▮" : "▮";
                  const isSel = selected === n.bssid;
                  return (
                    <tr
                      key={n.bssid}
                      onClick={() => setSelected(n.bssid)}
                      className={`cursor-pointer border-t border-[var(--neon)]/10 ${isSel ? "bg-[var(--neon)]/15" : "hover:bg-[var(--neon)]/5"}`}
                    >
                      <td className="p-1.5 font-mono opacity-80">{n.bssid}</td>
                      <td>
                        {n.essid}{" "}
                        {n.cracked && <Unlock className="inline h-3 w-3 ml-1 text-[var(--neon)]" />}
                      </td>
                      <td className="text-center">{n.channel}</td>
                      <td className="text-center">
                        <span className="neon-text">{bars}</span>{" "}
                        <span className="opacity-50 text-[10px]">{n.signal}</span>
                      </td>
                      <td className="text-center">
                        {n.enc === "OPEN" ? (
                          <span className="opacity-50">OPEN</span>
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            <Lock className="h-2.5 w-2.5" />
                            {n.enc}
                          </span>
                        )}
                      </td>
                      <td className="text-center">{n.clients}</td>
                      <td className="text-center">
                        {n.handshake ? <span className="neon-text">✓</span> : "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="flex flex-col bg-black/40">
        <div className="p-3 border-b border-[var(--neon)]/20">
          {!target ? (
            <div className="text-center py-6 opacity-50">
              <WifiOff className="h-8 w-8 mx-auto mb-2" />
              select a network
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="h-4 w-4 text-[var(--neon)]" />
                <span className="neon-text">{target.essid}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] opacity-80">
                <div>BSSID</div>
                <div className="font-mono">{target.bssid}</div>
                <div>Channel</div>
                <div>{target.channel}</div>
                <div>Signal</div>
                <div>{target.signal} dBm</div>
                <div>Encryption</div>
                <div>{target.enc}</div>
                <div>Clients</div>
                <div>{target.clients}</div>
                <div>Handshake</div>
                <div>{target.handshake ? "captured" : "—"}</div>
                {target.cracked && (
                  <>
                    <div>Key</div>
                    <div className="neon-text">{target.cracked}</div>
                  </>
                )}
              </div>
              <div className="flex gap-1 mt-3">
                <button
                  disabled={target.enc === "OPEN" || cracking}
                  onClick={captureHandshake}
                  className="flex-1 px-2 py-1 neon-border rounded hover:bg-[var(--neon)]/15 disabled:opacity-40 flex items-center justify-center gap-1"
                >
                  <Radio className="h-3 w-3" /> Capture
                </button>
                <button
                  disabled={!target.handshake || cracking}
                  onClick={crack}
                  className="flex-1 px-2 py-1 neon-border rounded hover:bg-[var(--neon)]/15 disabled:opacity-40 neon-text"
                >
                  {cracking ? "..." : "Crack"}
                </button>
              </div>
              {cracking && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] opacity-70">
                    <span>{tries} keys</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1 bg-[var(--neon)]/15 rounded mt-1">
                    <div
                      className="h-full bg-[var(--neon)] rounded"
                      style={{ width: `${progress}%`, boxShadow: "0 0 6px var(--neon)" }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      stopRef.current = true;
                    }}
                    className="w-full mt-1 text-[10px] opacity-60 hover:opacity-100"
                  >
                    abort
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div
          ref={logRef}
          className="flex-1 overflow-auto p-2 font-mono text-[10px] leading-relaxed"
        >
          {logs.map((l, i) => (
            <div key={i} className="opacity-80">
              {l}
            </div>
          ))}
        </div>
        <div className="p-2 text-[9px] opacity-50 border-t border-[var(--neon)]/20">
          Simulation only — no real radio access. Educational replica of aircrack-ng workflow.
        </div>
      </aside>
    </div>
  );
}
