"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function ResultToast({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className={`toast ${toast.ok ? "success" : "error"}`}>
      <span className="toast-icon">{toast.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}</span>
      <span>{toast.message}</span>
    </div>
  );
}
