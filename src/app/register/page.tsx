"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
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
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" fill="currentColor" opacity="0.3"/>
              <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M16 3H8L6 7h12l-2-4z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
              <path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="auth-logo-text">Inventra</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start managing your inventory today</p>
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
            <label htmlFor="name" className="form-label">Full name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="new-password"
            />
            <span className="form-hint">At least 8 characters with one uppercase letter and one number</span>
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link href="/login" className="auth-link">
            Sign in
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
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
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
        .form-hint { font-size: 0.75rem; color: var(--text-muted); }
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
