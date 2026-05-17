"use client";

import { useMemo, useState } from "react";
import { applyPathParams, getPathParams, runApiOperation, toPrettyJson } from "@/lib/apiClient";
import { Search, AlertTriangle, Trash2, Play, Loader2 } from "lucide-react";

const METHOD_COLORS = { GET: "method-get", POST: "method-post", PUT: "method-put", DELETE: "method-delete" };

function parseJsonSafe(text, fallback) {
  if (!text || !text.trim()) return fallback;
  try { return JSON.parse(text); } catch { return null; }
}

export default function OperationPanel({ group, baseUrl, token, onToast }) {
  const [search, setSearch] = useState("");

  if (!group) return null;

  const ops = group.operations.filter((op) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return op.name.toLowerCase().includes(q) || op.path.toLowerCase().includes(q) || op.method.toLowerCase().includes(q);
  });

  return (
    <div className="content">
      <div className="dash-header">
        <h2>{group.label} Console</h2>
        <p>{group.description} — Run operations directly against the API</p>
      </div>

      <div className="search-input-wrap" style={{ marginBottom: "1rem", maxWidth: 400 }}>
        <Search size={14} className="search-input-icon" />
        <input
          placeholder="Search operations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="op-grid">
        {ops.map((op, idx) => (
          <OpCard key={op.id} operation={op} baseUrl={baseUrl} token={token} index={idx} onToast={onToast} />
        ))}
      </div>

      {ops.length === 0 && (
        <div className="empty-state glass-card" style={{ marginTop: "1rem" }}>
          <div className="empty-icon"><Search size={36} strokeWidth={1.5} /></div>
          <h3>No operations matched</h3>
          <p>Clear your search to see all operations</p>
        </div>
      )}
    </div>
  );
}

function OpCard({ operation, baseUrl, token, index, onToast }) {
  const pathKeys = useMemo(() => getPathParams(operation.path), [operation.path]);
  const [pathValues, setPathValues] = useState(() => pathKeys.reduce((a, k) => { a[k] = ""; return a; }, {}));
  const [queryText, setQueryText] = useState(toPrettyJson(operation.queryTemplate || {}));
  const [bodyText, setBodyText] = useState(toPrettyJson(operation.bodyTemplate || {}));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const requestPath = useMemo(() => applyPathParams(operation.path, pathValues), [operation.path, pathValues]);

  const run = async () => {
    if (operation.mode === "multipart") {
      setResult({ ok: false, status: "N/A", data: "Multipart upload requires a dedicated file uploader." });
      return;
    }
    const queryObj = parseJsonSafe(queryText, {});
    if (!queryObj) { setResult({ ok: false, status: "Bad JSON", data: "Fix query JSON" }); return; }
    const bodyObj = parseJsonSafe(bodyText, {});
    if (!bodyObj) { setResult({ ok: false, status: "Bad JSON", data: "Fix body JSON" }); return; }

    setLoading(true);
    try {
      const res = await runApiOperation({ baseUrl, token, method: operation.method, path: operation.path, pathParams: pathValues, queryObj, bodyObj });
      setResult(res);
      onToast({ ok: res.ok, message: `${operation.method} ${operation.name}: ${res.status}` });
    } catch (err) {
      setResult({ ok: false, status: "Error", data: err.message });
      onToast({ ok: false, message: err.message });
    } finally { setLoading(false); }
  };

  return (
    <article className={`op-card glass-card ${operation.method === "DELETE" ? "danger-border" : ""}`} style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}>
      <div className="op-card-head">
        <div>
          <h4>{operation.name}</h4>
          <p>{operation.summary || "Backend API operation"}</p>
        </div>
        <span className={`method-pill ${METHOD_COLORS[operation.method] || ""}`}>{operation.method}</span>
      </div>

      <code className="op-path">{requestPath}</code>

      {pathKeys.length > 0 && (
        <div className="op-fields">
          {pathKeys.map((key) => (
            <label key={key}>
              {key}
              <input value={pathValues[key] || ""} onChange={(e) => setPathValues((p) => ({ ...p, [key]: e.target.value }))} placeholder={`Enter ${key}`} />
            </label>
          ))}
        </div>
      )}

      <div className="op-fields">
        <label>Query JSON<textarea value={queryText} onChange={(e) => setQueryText(e.target.value)} rows={3} /></label>
        <label>Body JSON<textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={3} /></label>
      </div>

      {operation.method === "DELETE" && <div className="danger-warning"><AlertTriangle size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} /> Destructive: confirm the target ID before running.</div>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className={`btn ${operation.method === "DELETE" ? "btn-danger" : "btn-primary"}`} onClick={run} disabled={loading}>
          {loading ? <><Loader2 size={14} className="spin-icon" /> Running...</> : operation.method === "DELETE" ? <><Trash2 size={14} /> Run Delete</> : <><Play size={14} /> Run</>}
        </button>
      </div>

      {result && (
        <div className={`op-result ${result.ok ? "ok" : "bad"}`}>
          <div className="op-result-meta">
            <span><strong>Status:</strong> {result.status}</span>
            {result.elapsedMs !== undefined && <span><strong>Time:</strong> {result.elapsedMs}ms</span>}
          </div>
          {result.url && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", wordBreak: "break-all", marginBottom: "0.3rem" }}>{result.url}</div>}
          <pre>{typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
    </article>
  );
}
