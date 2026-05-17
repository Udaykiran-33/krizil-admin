"use client";

import { useState } from "react";
import { Settings, X, Database, Terminal } from "lucide-react";

const MODULE_VIEWS = [
  { id: "explorer", label: "Explorer", Icon: Database },
  { id: "console", label: "Console", Icon: Terminal },
];

export default function TopBar({ activeView, onViewChange, baseUrl, onBaseUrlChange, token, onTokenChange, groupLabel, isDashboard }) {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">{groupLabel || "Dashboard"}</span>
        </div>
        <div className="topbar-right">
          {/* Only show view tabs on module pages, not on dashboard */}
          {!isDashboard && (
            <div className="view-tabs">
              {MODULE_VIEWS.map((v) => (
                <button
                  key={v.id}
                  className={`view-tab ${activeView === v.id ? "active" : ""}`}
                  onClick={() => onViewChange(v.id)}
                >
                  <v.Icon size={13} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                  {v.label}
                </button>
              ))}
            </div>
          )}
          <button className="config-toggle" onClick={() => setShowConfig(!showConfig)}>
            {showConfig ? <><X size={13} style={{ verticalAlign: "-2px", marginRight: 3 }} /> Close</> : <><Settings size={13} style={{ verticalAlign: "-2px", marginRight: 3 }} /> Config</>}
          </button>
        </div>
      </header>

      {showConfig && (
        <div className="config-panel">
          <label>
            API Base URL
            <input value={baseUrl} onChange={(e) => onBaseUrlChange(e.target.value)} placeholder="http://localhost:3001/api/v1" />
          </label>
          <label>
            Bearer Token
            <input type="password" value={token} onChange={(e) => onTokenChange(e.target.value)} placeholder="Paste JWT here" />
          </label>
          <button className="btn btn-ghost" onClick={() => setShowConfig(false)}>Done</button>
        </div>
      )}
    </>
  );
}
