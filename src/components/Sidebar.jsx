"use client";

import {
  LayoutDashboard, Users, FileText, Film, Camera, MessageCircle,
  Server, Mail, Handshake, Bell, Megaphone, Crown, BarChart3,
  Music, Bookmark, ShieldCheck, Settings, KeyRound, Zap,
  CheckCircle2, XCircle,
} from "lucide-react";

const ICON_MAP = {
  dashboard: LayoutDashboard,
  users: Users,
  posts: FileText,
  reels: Film,
  stories: Camera,
  comments: MessageCircle,
  servers: Server,
  chat: Mail,
  collaborations: Handshake,
  notifications: Bell,
  ads: Megaphone,
  membership: Crown,
  analytics: BarChart3,
  audio: Music,
  saved: Bookmark,
  admin: ShieldCheck,
  system: Settings,
  auth: KeyRound,
};

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ id: "dashboard", label: "Dashboard" }],
  },
  {
    label: "Content",
    items: [
      { id: "users", label: "Users" },
      { id: "posts", label: "Posts" },
      { id: "reels", label: "Reels" },
      { id: "stories", label: "Stories" },
      { id: "comments", label: "Comments" },
    ],
  },
  {
    label: "Community",
    items: [
      { id: "servers", label: "Servers" },
      { id: "chat", label: "Chat" },
      { id: "collaborations", label: "Collabs" },
      { id: "notifications", label: "Notifications" },
    ],
  },
  {
    label: "Business",
    items: [
      { id: "ads", label: "Ads" },
      { id: "membership", label: "Membership" },
      { id: "analytics", label: "Analytics" },
      { id: "audio", label: "Audio" },
      { id: "saved", label: "Saved" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "admin", label: "Admin / Reports" },
      { id: "system", label: "System" },
      { id: "auth", label: "Auth" },
    ],
  },
];

export default function Sidebar({ activeGroup, onGroupChange, groups, token, onLogout }) {
  const getCounts = (id) => {
    const g = groups.find((g) => g.id === id);
    return g ? g.operations.length : 0;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1><Zap size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: "4px" }} /> Instayt Admin</h1>
        <small>Super Admin Console</small>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="nav-label">{section.label}</div>
            {section.items.map((item) => {
              const IconComp = ICON_MAP[item.id] || LayoutDashboard;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activeGroup === item.id ? "active" : ""}`}
                  onClick={() => onGroupChange(item.id)}
                >
                  <span className="icon"><IconComp size={16} /></span>
                  {item.label}
                  {item.id !== "dashboard" && (
                    <span className="badge">{getCounts(item.id)}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-row">
          {token ? <CheckCircle2 size={10} color="var(--green)" /> : <XCircle size={10} color="var(--red)" />}
          {token ? "Authenticated" : "No active session"}
        </div>
        <div className="status-row">
          <CheckCircle2 size={10} color="var(--green)" />
          API connected
        </div>
        {token && onLogout && (
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              marginTop: "0.75rem",
              padding: "0.4rem 0.5rem",
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.15)",
              borderRadius: "6px",
              color: "var(--red)",
              fontSize: "0.72rem",
              fontWeight: "600",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 150ms",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(248,113,113,0.18)";
              e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(248,113,113,0.1)";
              e.currentTarget.style.borderColor = "rgba(248,113,113,0.15)";
            }}
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
