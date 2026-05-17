"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { runApiOperation, getPathParams } from "@/lib/apiClient";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import {
  Radio, Inbox, Search, Loader2, Pencil, Trash2, ChevronLeft, ChevronRight,
  Check, X, Database, Users, FileText, Film, Camera, MessageCircle,
  Server, Mail, Handshake, Bell, Megaphone, Crown, BarChart3,
  Music, Bookmark, ShieldCheck, Settings, KeyRound, ArrowRight,
} from "lucide-react";

const PAGE_SIZE = 10;
const METHOD_COLORS = { GET: "method-get", POST: "method-post", PUT: "method-put", DELETE: "method-delete" };

const MODULE_ICON_MAP = {
  system: Settings, auth: KeyRound, users: Users, posts: FileText,
  comments: MessageCircle, reels: Film, stories: Camera, chat: Mail,
  notifications: Bell, servers: Server, collaborations: Handshake,
  ads: Megaphone, membership: Crown, analytics: BarChart3,
  audio: Music, saved: Bookmark, admin: ShieldCheck,
};

const MODULE_COLOR_MAP = {
  system: "#64748b", auth: "#a78bfa", users: "#4f8ef7", posts: "#3b82f6",
  comments: "#fbbf24", reels: "#f472b6", stories: "#fb923c", chat: "#34d399",
  notifications: "#f87171", servers: "#8b5cf6", collaborations: "#14b8a6",
  ads: "#ef4444", membership: "#eab308", analytics: "#06b6d4",
  audio: "#ec4899", saved: "#10b981", admin: "#ef4444",
};

const MODULE_DESCRIPTIONS = {
  system: "Monitor service health, uptime, and runtime configuration",
  auth: "Manage authentication flows, sessions, and security tokens",
  users: "View and manage all user accounts, profiles, and settings",
  posts: "Browse content feed, moderate posts, and manage engagement",
  comments: "Review and moderate comments, replies, and interactions",
  reels: "Manage video content, trending feeds, and reel engagement",
  stories: "Monitor ephemeral content, highlights, and story engagement",
  chat: "Oversee conversations, messages, and chat configuration",
  notifications: "Manage notification delivery and user alerts",
  servers: "Administer community servers, channels, and members",
  collaborations: "Track brand and creator collaboration workflows",
  ads: "Manage ad campaigns, review submissions, and track earnings",
  membership: "Handle subscription tiers, pricing, and transactions",
  analytics: "Access audience insights and content performance data",
  audio: "Manage audio library, trending tracks, and uploads",
  saved: "View saved content collections and bookmarks",
  admin: "Handle reports, bans, audit logs, and moderation queue",
};

export default function DataExplorer({ group, baseUrl, token, onToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [opLoading, setOpLoading] = useState(false);

  const getOps = group?.operations.filter((o) => o.method === "GET") || [];
  const primaryGet = getOps.find((o) => !/:/.test(o.path)) || getOps[0];
  const putOp = group?.operations.find((o) => o.method === "PUT");
  const deleteOp = group?.operations.find((o) => o.method === "DELETE");

  const fetchData = useCallback(async () => {
    if (!primaryGet) return;
    setLoading(true);
    try {
      const result = await runApiOperation({
        baseUrl, token, method: "GET",
        path: primaryGet.path, pathParams: {},
        queryObj: primaryGet.queryTemplate || {},
        bodyObj: {},
      });
      if (result.ok) {
        const d = result.data;
        const items = Array.isArray(d) ? d
          : d && typeof d === "object"
            ? (Array.isArray(d.data) ? d.data
              : Array.isArray(d.results) ? d.results
              : Array.isArray(d.items) ? d.items
              : Array.isArray(d.users) ? d.users
              : Array.isArray(d.posts) ? d.posts
              : Array.isArray(d.notifications) ? d.notifications
              : Array.isArray(d.conversations) ? d.conversations
              : Array.isArray(d.servers) ? d.servers
              : Array.isArray(d.campaigns) ? d.campaigns
              : Array.isArray(d.reports) ? d.reports
              : Array.isArray(d.logs) ? d.logs
              : [d])
            : [];
        setData(items);
        setPage(0);
        onToast({ ok: true, message: `Loaded ${items.length} ${group.label} records` });
      } else {
        setData([]);
        onToast({ ok: false, message: `Error ${result.status}: ${typeof result.data === "string" ? result.data : JSON.stringify(result.data).slice(0, 100)}` });
      }
    } catch (err) {
      setData([]);
      onToast({ ok: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token, primaryGet, onToast, group?.label]);

  useEffect(() => {
    setData(null);
    setSearch("");
    setPage(0);
    if (token && primaryGet) {
      fetchData();
    }
  }, [group?.id, token, primaryGet, fetchData]);

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter((k) => !["__v", "password", "refreshToken"].includes(k)).slice(0, 8);
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleEdit = async (formData) => {
    if (!putOp) return;
    setOpLoading(true);
    const id = formData._id || formData.id || "";
    const pathKeys = getPathParams(putOp.path);
    const pathParams = {};
    if (pathKeys.length > 0) pathParams[pathKeys[0]] = id;
    try {
      const result = await runApiOperation({ baseUrl, token, method: "PUT", path: putOp.path, pathParams, queryObj: {}, bodyObj: formData });
      onToast({ ok: result.ok, message: result.ok ? "Updated successfully!" : `Error: ${result.status}` });
      if (result.ok) { setEditItem(null); fetchData(); }
    } catch (err) { onToast({ ok: false, message: err.message }); }
    finally { setOpLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!deleteOp) return;
    setOpLoading(true);
    const pathKeys = getPathParams(deleteOp.path);
    const pathParams = {};
    if (pathKeys.length > 0) pathParams[pathKeys[0]] = id;
    try {
      const result = await runApiOperation({ baseUrl, token, method: "DELETE", path: deleteOp.path, pathParams, queryObj: {}, bodyObj: {} });
      onToast({ ok: result.ok, message: result.ok ? "Deleted!" : `Error: ${result.status}` });
      if (result.ok) { setDeleteId(null); fetchData(); }
    } catch (err) { onToast({ ok: false, message: err.message }); }
    finally { setOpLoading(false); }
  };

  const formatCell = (value) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? <Check size={14} color="var(--green)" /> : <X size={14} color="var(--red)" />;
    if (Array.isArray(value)) return `${value.length} items`;
    if (typeof value === "object") {
      const s = JSON.stringify(value);
      return s.length > 40 ? s.slice(0, 37) + "…" : s;
    }
    const s = String(value);
    return s.length > 50 ? s.slice(0, 47) + "…" : s;
  };

  if (!group) return null;

  const ModIcon = MODULE_ICON_MAP[group.id] || Settings;
  const moduleColor = MODULE_COLOR_MAP[group.id] || "#4f8ef7";
  const moduleDesc = MODULE_DESCRIPTIONS[group.id] || group.description;

  const getCount = group.operations.filter((o) => o.method === "GET").length;
  const postCount = group.operations.filter((o) => o.method === "POST").length;
  const putCount = group.operations.filter((o) => o.method === "PUT").length;
  const deleteCount = group.operations.filter((o) => o.method === "DELETE").length;

  return (
    <div className="content">
      {/* ── Module Header ── */}
      <div className="module-header" style={{ "--mod-color": moduleColor }}>
        <div className="module-header-icon" style={{ color: moduleColor, background: `${moduleColor}18` }}>
          <ModIcon size={28} />
        </div>
        <div className="module-header-info">
          <h2>{group.label}</h2>
          <p>{moduleDesc}</p>
        </div>
        <div className="module-header-stats">
          <div className="mh-stat"><span className="mh-stat-val">{getCount}</span><span className="mh-stat-label">GET</span></div>
          <div className="mh-stat"><span className="mh-stat-val">{postCount}</span><span className="mh-stat-label">POST</span></div>
          <div className="mh-stat"><span className="mh-stat-val">{putCount}</span><span className="mh-stat-label">PUT</span></div>
          <div className="mh-stat"><span className="mh-stat-val">{deleteCount}</span><span className="mh-stat-label">DEL</span></div>
        </div>
      </div>

      {/* Available operations */}
      <div className="ops-pills-row">
        {group.operations.map((op) => (
          <span key={op.id} className={`method-pill ${METHOD_COLORS[op.method]}`} title={op.path}>
            {op.method} {op.name}
          </span>
        ))}
      </div>

      {/* Data table card */}
      <div className="glass-card table-card">
        <div className="table-header">
          <h3>{group.label} Records</h3>
          <div className="table-actions-row">
            {data && data.length > 0 && (
              <div className="search-input-wrap">
                <Search size={14} className="search-input-icon" />
                <input
                  placeholder="Filter records..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="search-input"
                />
              </div>
            )}
            <button className="btn btn-primary" onClick={fetchData} disabled={loading || !primaryGet}>
              {loading ? <><Loader2 size={14} className="spin-icon" /> Loading...</> : <><Radio size={14} /> Fetch Data</>}
            </button>
          </div>
        </div>

        {loading && <div className="loading-bar" />}

        {!data && !loading ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ color: moduleColor }}><Database size={40} strokeWidth={1.5} /></div>
            <h3>Ready to fetch {group.label}</h3>
            <p>Click &quot;Fetch Data&quot; to load records from <code style={{ color: moduleColor, fontSize: "0.8rem" }}>{primaryGet?.path || "API"}</code></p>
          </div>
        ) : data && data.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon"><Inbox size={40} strokeWidth={1.5} /></div>
            <h3>No records found</h3>
            <p>The API returned an empty result set</p>
          </div>
        ) : filtered.length === 0 && search ? (
          <div className="empty-state">
            <div className="empty-icon"><Search size={40} strokeWidth={1.5} /></div>
            <h3>No matches for &quot;{search}&quot;</h3>
            <p>Try a different search term</p>
          </div>
        ) : data && data.length > 0 ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    {columns.map((col) => <th key={col}>{col.replace(/_/g, " ")}</th>)}
                    {(putOp || deleteOp) && <th style={{ textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((row, i) => (
                    <tr key={row._id || row.id || i}>
                      <td style={{ color: "var(--text-m)", fontSize: "0.75rem" }}>{page * PAGE_SIZE + i + 1}</td>
                      {columns.map((col) => <td key={col} title={String(row[col] ?? "")}>{formatCell(row[col])}</td>)}
                      {(putOp || deleteOp) && (
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          {putOp && <button className="btn-icon" title="Edit" onClick={() => setEditItem(row)}><Pencil size={14} /></button>}
                          {deleteOp && <button className="btn-icon danger" title="Delete" onClick={() => setDeleteId(row._id || row.id)} style={{ marginLeft: 4 }}><Trash2 size={14} /></button>}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-pagination">
              <span>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} records</span>
              <div className="pagination-controls">
                <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /> Prev</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                  <button key={i} className={`page-btn ${page === i ? "active" : ""}`} onClick={() => setPage(i)}>{i + 1}</button>
                ))}
                {totalPages > 7 && <span style={{ padding: "0 0.3rem", color: "var(--text-m)" }}>…</span>}
                <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next <ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <EditModal data={editItem} onSave={handleEdit} onClose={() => setEditItem(null)} loading={opLoading} />
      <DeleteModal itemId={deleteId} onConfirm={handleDelete} onClose={() => setDeleteId(null)} loading={opLoading} />
    </div>
  );
}
