"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

export default function DeleteModal({ itemId, onConfirm, onClose, loading }) {
  const [confirmText, setConfirmText] = useState("");

  if (!itemId) return null;

  const confirmed = confirmText === "DELETE";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Trash2 size={16} style={{ verticalAlign: "-2px", marginRight: 6 }} /> Confirm Delete</h3>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="danger-warning">
            <strong><AlertTriangle size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} /> This action is irreversible.</strong>
            <p style={{ marginTop: "0.3rem" }}>You are about to permanently delete item <code style={{ color: "#fff" }}>{itemId}</code>. This cannot be undone.</p>
          </div>
          <label>
            Type <strong>DELETE</strong> to confirm
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoFocus
            />
          </label>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={() => onConfirm(itemId)} disabled={!confirmed || loading}>
            {loading ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
