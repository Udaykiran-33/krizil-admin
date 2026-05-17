"use client";

import { useState, useCallback } from "react";
import { apiGroups } from "@/data/operations";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Dashboard from "./Dashboard";
import DataExplorer from "./DataExplorer";
import OperationPanel from "./OperationPanel";
import ResultToast from "./ResultToast";

export default function AdminConsole() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3001/api/v1");
  const [token, setToken] = useState("");
  const [activeGroup, setActiveGroup] = useState("dashboard");
  const [activeView, setActiveView] = useState("explorer"); // default sub-view for modules
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    setToasts((prev) => [...prev, { ...t, id: Date.now() + Math.random() }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

  return (
    <div className="app-shell">
      <Sidebar activeGroup={activeGroup} onGroupChange={handleGroupChange} groups={apiGroups} token={token} />
      <div className="main-area">
        <TopBar
          activeView={activeView}
          onViewChange={handleViewChange}
          baseUrl={baseUrl}
          onBaseUrlChange={setBaseUrl}
          token={token}
          onTokenChange={setToken}
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
