"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", role: "STAFF" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      localStorage.setItem("userRole", data.user.role);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card">
        <Link href="/" className="auth-logo" style={{ textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Inventra Logo" width={48} height={48} priority style={{ objectFit: 'contain' }} />
          <span className="auth-logo-text">Inventra</span>
        </Link>

        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your inventory dashboard</p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "0.5rem" }}>
            <label className="form-label">Sign in as</label>
            <div className="role-options">
              <label className={`role-card ${form.role === "ADMIN" ? "role-active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={form.role === "ADMIN"}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ display: "none" }}
                />
                <div className="role-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="role-title">Admin</div>
                  <div className="role-desc">Full access</div>
                </div>
              </label>
              
              <label className={`role-card ${form.role === "STAFF" ? "role-active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="STAFF"
                  checked={form.role === "STAFF"}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ display: "none" }}
                />
                <div className="role-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="role-title">Staff</div>
                  <div className="role-desc">Limited access</div>
                </div>
              </label>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="auth-demo">
          <span>Demo account:</span>
          <button
            type="button"
            className="auth-demo-fill"
            onClick={() =>
              setForm({ email: "staff@inventra.dev", password: "Demo1234!", role: "STAFF" })
            }
          >
            Fill staff credentials
          </button>
        </div>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="auth-link">
            Create one
          </Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
        }
        .auth-glow {
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: var(--shadow);
          position: relative;
          z-index: 1;
          animation: slideUp 0.4s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }
        .auth-logo-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--teal), var(--indigo));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .auth-logo-text {
          font-size: 1.375rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--teal), var(--indigo));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-header { margin-bottom: 1.75rem; }
        .auth-title {
          font-size: 1.625rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.375rem;
        }
        .auth-subtitle { color: var(--text-secondary); font-size: 0.9rem; }
        .auth-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
        }
        .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-label { font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); }
        .form-input {
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }
        .form-input::placeholder { color: var(--text-muted); }
        .form-input:focus {
          outline: none;
          border-color: var(--teal);
          box-shadow: 0 0 0 3px var(--teal-glow);
        }
        .role-options { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .role-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.2s;
          background: var(--bg-secondary);
        }
        .role-card:hover { border-color: rgba(6,182,212,0.4); }
        .role-active {
          border-color: var(--teal);
          background: var(--teal-glow);
          box-shadow: 0 0 0 1px var(--teal);
        }
        .role-icon { color: var(--text-muted); display: flex; }
        .role-active .role-icon { color: var(--teal); }
        .role-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
        .role-desc { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem; }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          border-radius: var(--radius-sm);
          padding: 0.75rem 1.5rem;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--teal), var(--indigo));
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(6,182,212,0.3);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-full { width: 100%; margin-top: 0.25rem; }
        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-demo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.25rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .auth-demo-fill {
          background: none;
          border: none;
          color: var(--teal);
          cursor: pointer;
          font-size: 0.8rem;
          font-family: inherit;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .auth-demo-fill:hover { opacity: 0.8; }
        .auth-switch {
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 1.5rem;
        }
        .auth-link { color: var(--teal); text-decoration: none; font-weight: 500; }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
