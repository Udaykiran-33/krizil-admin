"use client";

import { useState, useEffect } from "react";
import { Pencil, X } from "lucide-react";

export default function EditModal({ data, onSave, onClose, loading }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data) setFormData({ ...data });
  }, [data]);

  if (!data) return null;

  const fields = Object.entries(formData).filter(
    ([key]) => !["_id", "__v", "createdAt", "updatedAt", "password"].includes(key)
  );

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Pencil size={16} style={{ verticalAlign: "-2px", marginRight: 6 }} /> Edit Record</h3>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          {fields.map(([key, value]) => (
            <label key={key}>
              {key}
              {typeof value === "boolean" ? (
                <select value={String(value)} onChange={(e) => handleChange(key, e.target.value === "true")}>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : typeof value === "object" ? (
                <textarea
                  value={JSON.stringify(value, null, 2)}
                  onChange={(e) => {
                    try { handleChange(key, JSON.parse(e.target.value)); } catch { /* skip */ }
                  }}
                  rows={3}
                />
              ) : (
                <input
                  value={String(value ?? "")}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(formData)} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
