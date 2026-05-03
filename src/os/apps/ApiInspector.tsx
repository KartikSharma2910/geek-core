import { useState } from "react";

export function ApiInspector() {
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("");
  const [resp, setResp] = useState<{ status?: number; headers?: Record<string,string>; body?: string; error?: string; ms?: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true); setResp(null);
    const t0 = performance.now();
    try {
      const init: RequestInit = { method };
      if (method !== "GET" && body) {
        init.body = body;
        init.headers = { "Content-Type": "application/json" };
      }
      const r = await fetch(url, init);
      const text = await r.text();
      const headers: Record<string,string> = {};
      r.headers.forEach((v, k) => { headers[k] = v; });
      setResp({ status: r.status, headers, body: text, ms: performance.now() - t0 });
    } catch (e: unknown) {
      setResp({ error: e instanceof Error ? e.message : String(e), ms: performance.now() - t0 });
    } finally { setLoading(false); }
  };

  return (
    <div className="p-3 space-y-3 text-xs">
      <div className="flex gap-2">
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-black/50 neon-border rounded px-2 py-1">
          {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => <option key={m}>{m}</option>)}
        </select>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 bg-black/50 neon-border rounded px-2 py-1 font-mono" />
        <button onClick={send} disabled={loading} className="px-3 py-1 neon-border rounded hover:bg-[var(--neon)]/15 neon-text disabled:opacity-50">
          {loading ? "..." : "SEND"}
        </button>
      </div>
      {method !== "GET" && (
        <textarea
          value={body} onChange={(e) => setBody(e.target.value)}
          placeholder='{"key": "value"}'
          className="w-full h-20 bg-black/50 neon-border rounded p-2 font-mono"
        />
      )}
      {resp && (
        <div className="space-y-2">
          <div className="flex gap-3 items-center">
            {resp.status !== undefined && <span className="neon-text">{resp.status}</span>}
            {resp.error && <span className="text-destructive">{resp.error}</span>}
            <span className="opacity-60">{resp.ms?.toFixed(0)} ms</span>
          </div>
          {resp.headers && (
            <div className="neon-border rounded p-2 bg-black/40">
              <div className="opacity-60 mb-1 uppercase text-[10px]">Headers</div>
              <pre className="whitespace-pre-wrap break-all">
                {Object.entries(resp.headers).map(([k, v]) => `${k}: ${v}`).join("\n")}
              </pre>
            </div>
          )}
          {resp.body && (
            <div className="neon-border rounded p-2 bg-black/40 max-h-72 overflow-auto">
              <div className="opacity-60 mb-1 uppercase text-[10px]">Body</div>
              <pre className="whitespace-pre-wrap break-all">{resp.body}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
