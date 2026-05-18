"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users, Eye, Film, FileText,
  Camera, ArrowUpRight, TrendingUp, ShieldCheck, Crown,
  Megaphone, BarChart3, ArrowRight, Server, Settings,
  KeyRound, Handshake, Bell, Mail, Music, Bookmark, MessageCircle,
  Heart, MessageSquare, Share2, UserPlus, Clock, AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip,
  XAxis, YAxis, PieChart, Pie, Cell,
} from "recharts";
import { runApiOperation } from "@/lib/apiClient";

/* ── Static chart data ── */
const weeklyUserData = [
  { day: "Mon", users: 3100 }, { day: "Tue", users: 3400 },
  { day: "Wed", users: 2900 }, { day: "Thu", users: 3800 },
  { day: "Fri", users: 4200 }, { day: "Sat", users: 4800 },
  { day: "Sun", users: 3200 },
];

const revenueData = [
  { month: "Jan", revenue: 380 }, { month: "Feb", revenue: 420 },
  { month: "Mar", revenue: 510 }, { month: "Apr", revenue: 470 },
  { month: "May", revenue: 580 },
];

const contentBreakdown = [
  { name: "Posts", value: 15000000, color: "#4f8ef7" },
  { name: "Reels", value: 8000000, color: "#34d399" },
  { name: "Stories", value: 5200000, color: "#fbbf24" },
  { name: "Comments", value: 32000000, color: "#a78bfa" },
];

const dailyContentData = [
  { day: "Mon", posts: 12400, reels: 8200, stories: 6100 },
  { day: "Tue", posts: 11800, reels: 9400, stories: 7200 },
  { day: "Wed", posts: 14200, reels: 7800, stories: 5800 },
  { day: "Thu", posts: 13600, reels: 10200, stories: 6900 },
  { day: "Fri", posts: 15800, reels: 11400, stories: 8100 },
  { day: "Sat", posts: 18200, reels: 14600, stories: 9800 },
  { day: "Sun", posts: 16400, reels: 12800, stories: 7400 },
];

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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ groups, onNavigate, baseUrl, token, onToast }) {
  const [realStats, setRealStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const intervalRef = useRef(null);
  const totalOps = groups.reduce((t, g) => t + g.operations.length, 0);

  async function fetchStats(silent = false) {
    if (!silent) setIsRefreshing(true);
    setFetchError(null);
    try {
      const result = await runApiOperation({
        baseUrl,
        token,
        method: "GET",
        path: "/admin/dashboard",
        pathParams: {},
        queryObj: {},
        bodyObj: {},
      });
      if (result.ok) {
        const stats = result.data?.data || result.data;
        setRealStats(stats);
        setLastSynced(new Date());
      } else {
        setFetchError(`Server responded ${result.status}`);
        console.error("Dashboard fetch error:", result.status, result.data);
      }
    } catch (err) {
      setFetchError("Network error — retrying…");
      console.error("Dashboard fetch threw:", err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }

  // Start live polling on mount, clear on unmount
  useEffect(() => {
    if (!token || !baseUrl) return;

    // Immediate first fetch
    fetchStats(false);

    // Poll every 3 seconds for live data
    intervalRef.current = setInterval(() => fetchStats(true), 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, baseUrl]);

  const platformStats = [
    { Icon: Users, cls: "blue", label: "Total Users", value: realStats?.total_users ?? "—", trend: "Live from DB", tc: "up" },
    { Icon: Eye, cls: "green", label: "Active Users", value: realStats?.active_users ?? "—", trend: "Live from DB", tc: "up" },
    { Icon: FileText, cls: "amber", label: "Total Posts", value: realStats?.total_posts ?? "—", trend: "Live from DB", tc: "up" },
    { Icon: Film, cls: "green", label: "Total Reels", value: realStats?.total_reels ?? "—", trend: "Live from DB", tc: "up" },
  ];

  const moderationStats = [
    { label: "Pending Reports", value: realStats?.pending_reports ?? "—", Icon: AlertTriangle, color: "var(--red)" },
    { label: "Resolved Today", value: 128, Icon: ShieldCheck, color: "var(--green)" },
    { label: "Banned Today", value: 12, Icon: Users, color: "var(--amber)" },
  ];

  const timeStr = lastSynced
    ? lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "Syncing…";

  return (
    <div className="content">
      {/* ── Hero Header ── */}
      <div className="dash-hero">
        <div className="dash-hero-text">
          <h2>Welcome back, Super Admin</h2>
          <p>Here&apos;s what&apos;s happening across your platform today.</p>
        </div>
        <div className="dash-hero-meta">
          <span className="hero-badge live" style={{ borderColor: "rgba(52,211,153,0.3)", color: "var(--green)" }}>
            <span
              className="live-dot"
              style={{ background: "var(--green)", boxShadow: "0 0 8px var(--green)" }}
            />
            {fetchError ? `⚠ ${fetchError}` : `Live Auto-Sync · ${timeStr}`}
          </span>
          <button
            className="btn btn-ghost"
            style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}
            onClick={() => fetchStats(false)}
            disabled={isRefreshing}
          >
            <RefreshCw size={12} className={isRefreshing ? "spin-icon" : ""} />
            {isRefreshing ? " Refreshing…" : " Refresh"}
          </button>
          <span className="hero-badge">{totalOps} API Routes</span>
          <span className="hero-badge">{groups.length} Modules</span>
        </div>
      </div>

      {/* ── Platform KPIs ── */}
      <div className="stats-grid-4">
        {platformStats.map((s) => (
          <div key={s.label} className="kpi-card glass-card">
            <div className="kpi-top">
              <div className={`kpi-icon ${s.cls}`}><s.Icon size={20} /></div>
              <span className={`kpi-trend ${s.tc}`}><ArrowUpRight size={12} /> {s.trend}</span>
            </div>
            <div className="kpi-value">{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="charts-row">
        <div className="chart-card glass-card">
          <div className="chart-card-header">
            <div>
              <h3>New Signups</h3>
              <p>Daily new user registrations this week</p>
            </div>
            <span className="kpi-trend up"><TrendingUp size={12} /> +14.2%</span>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyUserData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f8ef7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4f8ef7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" stroke="#4f8ef7" strokeWidth={2} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="chart-card-header">
            <div>
              <h3>Revenue Trend</h3>
              <p>Monthly revenue in thousands ($K)</p>
            </div>
            <span className="kpi-trend up"><ArrowUpRight size={12} /> +23.4%</span>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Content & Activity Row ── */}
      <div className="dual-panel-row">
        <div className="chart-card glass-card">
          <div className="chart-card-header">
            <div>
              <h3>Content Created</h3>
              <p>Daily content breakdown by type</p>
            </div>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyContentData} barGap={2}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="posts" stackId="a" fill="#4f8ef7" radius={[0, 0, 0, 0]} name="Posts" />
                <Bar dataKey="reels" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} name="Reels" />
                <Bar dataKey="stories" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Stories" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <span><span className="legend-dot" style={{ background: "#4f8ef7" }} /> Posts</span>
            <span><span className="legend-dot" style={{ background: "#34d399" }} /> Reels</span>
            <span><span className="legend-dot" style={{ background: "#fbbf24" }} /> Stories</span>
          </div>
        </div>

        {/* Live Stats from DB */}
        <div className="chart-card glass-card activity-panel">
          <div className="chart-card-header">
            <div>
              <h3>Live Platform Stats</h3>
              <p>Direct from AWS MongoDB · auto-refreshes every 3s</p>
            </div>
          </div>
          <div className="activity-feed">
            {[
              { label: "Total Users", value: realStats?.total_users, icon: Users, color: "#4f8ef7" },
              { label: "Active Users", value: realStats?.active_users, icon: Eye, color: "#34d399" },
              { label: "Total Posts", value: realStats?.total_posts, icon: FileText, color: "#fbbf24" },
              { label: "Total Reels", value: realStats?.total_reels, icon: Film, color: "#f472b6" },
              { label: "Pending Reports", value: realStats?.pending_reports, icon: AlertTriangle, color: "#f87171" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="activity-item info" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ color, background: `${color}18`, borderRadius: "8px", padding: "6px", display: "flex" }}>
                  <Icon size={16} />
                </div>
                <div className="activity-content" style={{ flex: 1 }}>
                  <span className="activity-text">{label}</span>
                </div>
                <span style={{ fontWeight: 700, color, fontSize: "1.05rem" }}>
                  {value ?? (isRefreshing ? "…" : "—")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Engagement + Moderation Row ── */}
      <div className="dual-panel-row">
        <div className="glass-card" style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>Live Engagement</h3>
          <div className="engagement-compact-grid">
            {[
              { Icon: Heart, label: "Likes Today", value: "2.8M", color: "#f87171" },
              { Icon: MessageSquare, label: "Comments", value: "320K", color: "#fbbf24" },
              { Icon: Share2, label: "Shares", value: "95K", color: "#4f8ef7" },
              { Icon: UserPlus, label: "New Signups", value: realStats?.total_users ?? "—", color: "#34d399" },
              { Icon: Clock, label: "Content Today", value: "45K", color: "#a78bfa" },
              { Icon: Film, label: "Reels Created", value: realStats?.total_reels ?? "—", color: "#f472b6" },
            ].map((s) => (
              <div key={s.label} className="eng-row">
                <div className="eng-row-icon" style={{ color: s.color, background: `${s.color}15` }}><s.Icon size={16} /></div>
                <span className="eng-row-label">{s.label}</span>
                <span className="eng-row-value">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 600 }}>Moderation Queue</h3>
            <button className="btn btn-ghost" style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem" }} onClick={() => onNavigate("admin")}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="moderation-stats">
            {moderationStats.map((s) => (
              <div key={s.label} className="mod-stat">
                <div className="mod-stat-icon" style={{ color: s.color, background: `${s.color}15` }}><s.Icon size={18} /></div>
                <div className="mod-stat-value">{s.value}</div>
                <div className="mod-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="content-distribution">
            <h4 style={{ fontSize: "0.75rem", color: "var(--text-m)", marginBottom: "0.5rem", marginTop: "0.75rem" }}>Content Distribution</h4>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={contentBreakdown} cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={3} dataKey="value">
                  {contentBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend" style={{ justifyContent: "center" }}>
              {contentBreakdown.map((c) => (
                <span key={c.name}><span className="legend-dot" style={{ background: c.color }} /> {c.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Navigation Modules ── */}
      <div className="section-label" style={{ marginTop: "0.5rem" }}>All Modules</div>
      <div className="modules-grid-compact">
        {groups.map((g) => {
          const ModIcon = MODULE_ICON_MAP[g.id] || Settings;
          const color = MODULE_COLOR_MAP[g.id] || "#4f8ef7";
          return (
            <div key={g.id} className="module-card glass-card" onClick={() => onNavigate(g.id)}>
              <div className="module-card-icon" style={{ color, background: `${color}18` }}>
                <ModIcon size={18} />
              </div>
              <div className="module-card-info">
                <h4>{g.label}</h4>
                <p>{g.operations.length} routes</p>
              </div>
              <ArrowRight size={14} className="module-card-arrow" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
