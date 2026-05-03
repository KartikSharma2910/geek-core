import { useEffect, useState } from "react";
import { Globe2, Shield, ShieldOff, Loader2, MapPin, Wifi, Server, Network } from "lucide-react";
import { sfx } from "../sound";
import { useOS } from "../store";

interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  org?: string;
  asn?: string;
  network?: string;
  version?: string;
}

interface ExitNode {
  id: string;
  city: string;
  country: string;
  flag: string;
  ping: number;
  load: number;
  ip: string;
}

const NODES: ExitNode[] = [
  { id: "nl-ams", city: "Amsterdam", country: "Netherlands", flag: "🇳🇱", ping: 28, load: 32, ip: "185.107.56.21" },
  { id: "de-fra", city: "Frankfurt", country: "Germany", flag: "🇩🇪", ping: 34, load: 41, ip: "194.36.111.84" },
  { id: "us-nyc", city: "New York", country: "United States", flag: "🇺🇸", ping: 102, load: 58, ip: "104.244.74.155" },
  { id: "us-sfo", city: "San Francisco", country: "United States", flag: "🇺🇸", ping: 178, load: 47, ip: "199.249.230.110" },
  { id: "jp-tyo", city: "Tokyo", country: "Japan", flag: "🇯🇵", ping: 220, load: 25, ip: "45.32.56.187" },
  { id: "sg-sin", city: "Singapore", country: "Singapore", flag: "🇸🇬", ping: 188, load: 36, ip: "139.180.140.22" },
  { id: "ch-zur", city: "Zürich", country: "Switzerland", flag: "🇨🇭", ping: 42, load: 19, ip: "185.220.101.7" },
  { id: "is-rkv", city: "Reykjavík", country: "Iceland", flag: "🇮🇸", ping: 64, load: 12, ip: "82.221.139.190" },
  { id: "ro-buc", city: "Bucharest", country: "Romania", flag: "🇷🇴", ping: 58, load: 22, ip: "89.45.224.55" },
];

const PROTOCOLS = ["WireGuard", "OpenVPN UDP", "OpenVPN TCP", "IKEv2"];

export function VPN() {
  const { unlock } = useOS();
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [node, setNode] = useState<ExitNode>(NODES[0]);
  const [proto, setProto] = useState(PROTOCOLS[0]);
  const [killSwitch, setKillSwitch] = useState(true);
  const [dnsLeak, setDnsLeak] = useState(false);
  const [bytes, setBytes] = useState({ up: 0, down: 0 });
  const [duration, setDuration] = useState(0);

  const loadIp = async () => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch("https://ipapi.co/json/");
      if (!r.ok) throw new Error("ipapi failed");
      const j = await r.json();
      setInfo(j);
    } catch {
      try {
        const r = await fetch("https://api.ipify.org?format=json");
        const j = await r.json();
        setInfo({ ip: j.ip });
      } catch {
        setErr("Could not detect IP. Check connection.");
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { loadIp(); }, []);

  useEffect(() => {
    if (!connected) return;
    const t = setInterval(() => {
      setDuration((d) => d + 1);
      setBytes((b) => ({
        up: b.up + Math.random() * 12000,
        down: b.down + Math.random() * 65000,
      }));
    }, 1000);
    return () => clearInterval(t);
  }, [connected]);

  const connect = async () => {
    setConnecting(true);
    sfx.click();
    await new Promise((r) => setTimeout(r, 1400));
    setConnected(true);
    setConnecting(false);
    setBytes({ up: 0, down: 0 });
    setDuration(0);
    sfx.achievement();
    unlock("vpn-first-connect");
  };
  const disconnect = () => {
    setConnected(false); sfx.close();
  };

  const fmtBytes = (n: number) => {
    if (n < 1024) return `${n.toFixed(0)} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1048576).toFixed(2)} MB`;
  };
  const fmtDur = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`;
  };

  const activeIp = connected ? node.ip : info?.ip ?? "—";
  const activeLoc = connected ? `${node.city}, ${node.country}` :
    info ? [info.city, info.region, info.country_name].filter(Boolean).join(", ") : "—";

  return (
    <div className="p-4 space-y-4 text-xs">
      {/* Status hero */}
      <div className={`neon-border rounded-lg p-4 ${connected ? "bg-[var(--neon)]/10" : "bg-black/40"}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {connected ? <Shield className="h-10 w-10 text-[var(--neon)] pulse-glow" /> : <ShieldOff className="h-10 w-10 opacity-60" />}
            <div>
              <div className="text-base font-bold neon-text">
                {connecting ? "ESTABLISHING TUNNEL…" : connected ? "PROTECTED" : "UNPROTECTED"}
              </div>
              <div className="opacity-70">{connected ? `via ${node.flag} ${node.city} · ${proto}` : "Direct connection — your real IP is exposed"}</div>
            </div>
          </div>
          <button
            disabled={connecting}
            onClick={connected ? disconnect : connect}
            className={`px-5 py-2 rounded-md neon-border font-bold tracking-wider text-xs ${
              connected ? "bg-destructive/30 hover:bg-destructive/50" : "bg-[var(--neon)]/20 hover:bg-[var(--neon)]/40"
            }`}
          >
            {connecting ? <Loader2 className="h-4 w-4 animate-spin inline" /> : connected ? "DISCONNECT" : "CONNECT"}
          </button>
        </div>
        {connected && (
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <Stat label="Session" value={fmtDur(duration)} />
            <Stat label="↓ Down" value={fmtBytes(bytes.down)} />
            <Stat label="↑ Up" value={fmtBytes(bytes.up)} />
          </div>
        )}
      </div>

      {/* IP details */}
      <div className="neon-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 neon-text"><Globe2 className="h-3.5 w-3.5" /> IP Intelligence</div>
          <button onClick={loadIp} className="text-[10px] px-2 py-0.5 neon-border rounded hover:bg-[var(--neon)]/15">Refresh</button>
        </div>
        {loading ? (
          <div className="opacity-60 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Probing…</div>
        ) : err ? (
          <div className="text-red-400">{err}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Field icon={<Network className="h-3 w-3" />} label="Public IP" value={activeIp} mono />
            <Field icon={<MapPin className="h-3 w-3" />} label="Location" value={activeLoc} />
            <Field icon={<Server className="h-3 w-3" />} label="ISP / Org" value={connected ? "GeekVPN Network" : info?.org ?? "—"} />
            <Field label="ASN" value={connected ? "AS-GEEK" : info?.asn ?? "—"} mono />
            <Field label="Timezone" value={info?.timezone ?? "—"} />
            <Field label="Postal" value={info?.postal ?? "—"} />
            <Field label="Latitude" value={info?.latitude?.toString() ?? "—"} mono />
            <Field label="Longitude" value={info?.longitude?.toString() ?? "—"} mono />
            <Field label="IP Version" value={info?.version ?? "IPv4"} />
          </div>
        )}
      </div>

      {/* Exit nodes */}
      <div className="neon-border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2 neon-text"><Wifi className="h-3.5 w-3.5" /> Exit Nodes</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-auto">
          {NODES.map((n) => (
            <button key={n.id}
              onClick={() => { setNode(n); sfx.click(); }}
              className={`flex items-center justify-between px-2 py-1.5 rounded neon-border text-left ${
                node.id === n.id ? "bg-[var(--neon)]/20" : "hover:bg-[var(--neon)]/10"
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{n.flag}</span>
                <div>
                  <div>{n.city}</div>
                  <div className="opacity-50 text-[10px]">{n.country}</div>
                </div>
              </div>
              <div className="text-right text-[10px]">
                <div className={n.ping < 80 ? "text-[var(--neon)]" : "opacity-70"}>{n.ping}ms</div>
                <div className="opacity-50">load {n.load}%</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="neon-border rounded-lg p-3 space-y-2">
        <div className="neon-text mb-1">Tunnel Configuration</div>
        <div className="flex items-center justify-between gap-2">
          <span className="opacity-70">Protocol</span>
          <select value={proto} onChange={(e) => setProto(e.target.value)}
            className="bg-black/60 neon-border rounded px-2 py-1 text-xs">
            {PROTOCOLS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <Toggle label="Kill switch (block traffic if VPN drops)" value={killSwitch} onChange={setKillSwitch} />
        <Toggle label="Block DNS leaks" value={!dnsLeak} onChange={(v) => setDnsLeak(!v)} />
        <div className="text-[10px] opacity-50 pt-1">
          Open-source style WireGuard/OpenVPN front-end. This build simulates the tunnel for educational purposes — your real traffic is not routed.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="neon-border rounded p-2">
      <div className="text-[10px] opacity-60">{label}</div>
      <div className="font-mono neon-text">{value}</div>
    </div>
  );
}
function Field({ icon, label, value, mono }: { icon?: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-black/30 rounded px-2 py-1.5">
      <div className="text-[10px] opacity-60 flex items-center gap-1">{icon}{label}</div>
      <div className={`truncate ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className="w-full flex justify-between items-center px-2 py-1.5 neon-border rounded hover:bg-[var(--neon)]/10 text-left">
      <span>{label}</span>
      <span className={`h-4 w-8 rounded-full relative transition ${value ? "bg-[var(--neon)]/60" : "bg-[var(--neon)]/15"}`}>
        <span className="absolute top-0.5 h-3 w-3 rounded-full bg-[var(--neon)] transition-all"
          style={{ left: value ? "calc(100% - 14px)" : "2px", boxShadow: "0 0 6px var(--neon)" }} />
      </span>
    </button>
  );
}
