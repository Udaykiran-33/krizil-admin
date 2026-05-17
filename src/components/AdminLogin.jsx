"use client";

import { useState } from "react";
import { Lock, Mail, Globe, Loader2, ShieldAlert, Zap } from "lucide-react";
import { runApiOperation } from "@/lib/apiClient";

export default function AdminLogin({ onLoginSuccess, onToast }) {
  const [email, setEmail] = useState("admin@instayt.com");
  const [password, setPassword] = useState("adminyt123");
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000/api/v1");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!baseUrl.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const result = await runApiOperation({
        baseUrl,
        token: "",
        method: "POST",
        path: "/auth/login",
        pathParams: {},
        queryObj: {},
        bodyObj: { email, password },
      });

      if (result.ok) {
        const payload = result.data?.data;
        const token = payload?.access_token;
        const user = payload?.user;

        // Verify if it is an admin user
        // Let's decode or inspect the token, but the backend handles access restriction.
        // We will call the dashboard endpoint immediately to verify auth is working!
        if (token) {
          onLoginSuccess(token, baseUrl);
          if (onToast) {
            onToast({ ok: true, message: `Welcome back, ${user?.username || "Admin"}!` });
          }
        } else {
          setErrorMsg("Login succeeded, but no access token was returned by the server.");
        }
      } else {
        const msg = result.data?.message || `Error ${result.status}: Connection Refused or Invalid Credentials`;
        setErrorMsg(msg);
        if (onToast) {
          onToast({ ok: false, message: `Login failed: ${msg}` });
        }
      }
    } catch (err) {
      console.error("Login component error:", err);
      setErrorMsg(`Connection error: ${err.message}. Make sure your backend is running on the selected API Base URL.`);
      if (onToast) {
        onToast({ ok: false, message: "Connection refused. Is backend running?" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container glass-card">
        <div className="login-header">
          <div className="login-logo">
            <Zap size={24} />
          </div>
          <h2>Super Admin Portal</h2>
          <p>Sign in to moderate and monitor your Instayt platform</p>
        </div>

        {errorMsg && (
          <div className="login-error-card">
            <ShieldAlert size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>
              <span className="form-label-text">API Base URL</span>
              <div className="input-with-icon">
                <Globe size={14} className="input-icon" />
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:3000/api/v1"
                  required
                />
              </div>
            </label>
          </div>

          <div className="form-group">
            <label>
              <span className="form-label-text">Email Address</span>
              <div className="input-with-icon">
                <Mail size={14} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@instayt.com"
                  required
                />
              </div>
            </label>
          </div>

          <div className="form-group">
            <label>
              <span className="form-label-text">Admin Password</span>
              <div className="input-with-icon">
                <Lock size={14} className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </label>
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                Authenticating...
              </>
            ) : (
              "Access Dashboard"
            )}
          </button>
        </form>

        <div className="login-footer">
          <small>Security clearance required. All login attempts are recorded in system logs.</small>
        </div>
      </div>

      <style jsx>{`
        .login-screen {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, #0d1a30 0%, #060d18 100%);
          z-index: 999;
          padding: 1.5rem;
        }
        .login-container {
          width: 100%;
          max-width: 420px;
          padding: 2.25rem 2rem;
          border-radius: 16px;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .login-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }
        .login-logo {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f8ef7, #34d399);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin: 0 auto 1rem;
          box-shadow: 0 4px 15px rgba(79, 142, 247, 0.4);
        }
        .login-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.35rem;
          background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .login-header p {
          font-size: 0.78rem;
          color: #64748b;
          line-height: 1.4;
        }
        .login-error-card {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 8px;
          padding: 0.75rem 0.85rem;
          color: #fca5a5;
          font-size: 0.75rem;
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          margin-bottom: 1.25rem;
          line-height: 1.4;
        }
        .login-form {
          display: grid;
          gap: 1.1rem;
        }
        .form-group {
          display: grid;
        }
        .form-label-text {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 0.4rem;
          display: inline-block;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          color: #64748b;
        }
        .input-with-icon input {
          padding-left: 2.25rem !important;
          height: 40px;
          font-size: 0.82rem;
          border-radius: 8px;
        }
        .login-btn {
          height: 42px;
          justify-content: center;
          font-size: 0.85rem;
          margin-top: 0.4rem;
        }
        .login-footer {
          margin-top: 1.75rem;
          text-align: center;
          color: #475569;
          line-height: 1.4;
        }
        .login-footer small {
          font-size: 0.65rem;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
