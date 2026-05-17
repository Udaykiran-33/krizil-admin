"use client";

import { useState, useCallback, useEffect } from "react";
import { apiGroups } from "@/data/operations";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Dashboard from "./Dashboard";
import DataExplorer from "./DataExplorer";
import OperationPanel from "./OperationPanel";
import ResultToast from "./ResultToast";
import AdminLogin from "./AdminLogin";

export default function AdminConsole() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000/api/v1");
  const [token, setToken] = useState("");
  const [activeGroup, setActiveGroup] = useState("dashboard");
  const [activeView, setActiveView] = useState("explorer"); // default sub-view for modules
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting for localStorage access
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("instayt_admin_token");
      const savedBaseUrl = localStorage.getItem("instayt_admin_baseUrl");
      if (savedToken) setToken(savedToken);
      if (savedBaseUrl) setBaseUrl(savedBaseUrl);
    }
    setMounted(true);
  }, []);

  const addToast = useCallback((t) => {
    setToasts((prev) => [...prev, { ...t, id: Date.now() + Math.random() }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleLoginSuccess = useCallback((newToken, newBaseUrl) => {
    setToken(newToken);
    setBaseUrl(newBaseUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("instayt_admin_token", newToken);
      localStorage.setItem("instayt_admin_baseUrl", newBaseUrl);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setToken("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("instayt_admin_token");
    }
    addToast({ ok: true, message: "Logged out successfully" });
  }, [addToast]);

  const handleGroupChange = (groupId) => {
    setActiveGroup(groupId);
    if (groupId !== "dashboard") setActiveView("explorer");
  };

  const handleViewChange = (view) => {
    if (activeGroup === "dashboard") return; // dashboard has no sub-views
    setActiveView(view);
  };

  const currentGroup = apiGroups.find((g) => g.id === activeGroup) || null;
  const groupLabel = activeGroup === "dashboard" ? "Dashboard" : currentGroup?.label || activeGroup;
  const isDashboard = activeGroup === "dashboard";

  // Prevent SSR flicker of login page when token is already in localStorage
  if (!mounted) {
    return null; 
  }

  if (!token) {
    return (
      <>
        <AdminLogin onLoginSuccess={handleLoginSuccess} onToast={addToast} />
        <ResultToast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar 
        activeGroup={activeGroup} 
        onGroupChange={handleGroupChange} 
        groups={apiGroups} 
        token={token} 
        onLogout={handleLogout}
      />
      <div className="main-area">
        <TopBar
          activeView={activeView}
          onViewChange={handleViewChange}
          baseUrl={baseUrl}
          onBaseUrlChange={(url) => {
            setBaseUrl(url);
            if (typeof window !== "undefined") localStorage.setItem("instayt_admin_baseUrl", url);
          }}
          token={token}
          onTokenChange={(t) => {
            setToken(t);
            if (typeof window !== "undefined") localStorage.setItem("instayt_admin_token", t);
          }}
          groupLabel={groupLabel}
          isDashboard={isDashboard}
        />
        <div className="page-transition">
          {isDashboard ? (
            <Dashboard groups={apiGroups} onNavigate={handleGroupChange} baseUrl={baseUrl} token={token} onToast={addToast} />
          ) : activeView === "console" ? (
            <OperationPanel group={currentGroup} baseUrl={baseUrl} token={token} onToast={addToast} />
          ) : (
            <DataExplorer group={currentGroup} baseUrl={baseUrl} token={token} onToast={addToast} />
          )}
        </div>
      </div>
      <ResultToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
