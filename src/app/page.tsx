"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-logo">
          <Image src="/logo.png" alt="Inventra Logo" width={40} height={40} priority style={{ objectFit: 'contain' }} />
          <span className="landing-logo-text">Inventra</span>
        </div>
        <div className="landing-nav-actions">
          {mounted && (
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          )}
          <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      <main className="landing-main">
        {/* Background Glow */}
        <div className="landing-glow" />

        <section className="hero-section">
          <div className="hero-badge">✨ Next-Generation Inventory</div>
          <h1 className="hero-title">
            Smart Inventory Management<br />
            <span className="hero-title-highlight">for Modern Teams</span>
          </h1>
          <p className="hero-subtitle">
            Track products, manage stock levels, and monitor low stock alerts in real-time from one beautiful, blazing-fast dashboard.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary btn-lg">Start for Free</Link>
            <Link href="/login" className="btn btn-secondary btn-lg">View Live Demo</Link>
          </div>
        </section>

        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ color: "var(--teal)", background: "rgba(6,182,212,0.1)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 9l-5 5-4-4-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Real-Time Analytics</h3>
              <p className="feature-desc">Visualize your entire inventory distribution and total stock value instantly on a dynamic dashboard.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon" style={{ color: "var(--indigo)", background: "rgba(99,102,241,0.1)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 className="feature-title">Atomic Tracking</h3>
              <p className="feature-desc">Log every single stock movement (in and out) with reasons and precise timestamps for complete accountability.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ color: "var(--yellow)", background: "rgba(245,158,11,0.1)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Low Stock Alerts</h3>
              <p className="feature-desc">Never run out of your best-selling items again with automated low stock thresholds and out-of-stock warnings.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ color: "var(--green)", background: "rgba(16,185,129,0.1)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v12M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 20h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">One-Click Export</h3>
              <p className="feature-desc">Download your entire product catalog and inventory data as a formatted CSV file in a single click.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Inventra. Open-source portfolio project.</p>
        <div className="footer-links">
          <a href="https://github.com/Aarsh-37/beram" target="_blank" rel="noreferrer">GitHub</a>
          <a href="/login">Demo</a>
        </div>
      </footer>

      <style>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          position: relative;
          overflow: hidden;
        }

        .landing-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 640px) { .landing-nav { padding: 1rem; } }

        .landing-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .landing-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--teal), var(--indigo));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .landing-logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--teal), var(--indigo));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .landing-nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theme-toggle {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .theme-toggle:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: var(--radius-sm);
          padding: 0.6rem 1.25rem;
          transition: all 0.2s;
          text-decoration: none;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--teal), var(--indigo));
          color: white;
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(6,182,212,0.3);
        }
        .btn-secondary {
          background: var(--bg-card);
          border-color: var(--border);
          color: var(--text-primary);
        }
        .btn-secondary:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-focus);
        }
        .btn-ghost {
          background: transparent;
          color: var(--text-secondary);
        }
        .btn-ghost:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
        }
        .btn-lg {
          padding: 0.875rem 1.75rem;
          font-size: 1rem;
        }
        .hidden { display: none; }
        @media (min-width: 640px) { .sm\\:inline-flex { display: inline-flex; } }

        .landing-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 1rem;
          position: relative;
        }

        .landing-glow {
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 80vw;
          height: 800px;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.08) 30%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        [data-theme='light'] .landing-glow {
          background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, rgba(6,182,212,0.05) 30%, transparent 70%);
        }

        .hero-section {
          max-width: 800px;
          width: 100%;
          text-align: center;
          padding: 6rem 0 4rem;
          position: relative;
          z-index: 10;
          animation: slideUp 0.6s ease-out forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 1rem;
          background: var(--teal-glow);
          color: var(--teal);
          border: 1px solid rgba(6,182,212,0.2);
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.15;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }
        .hero-title-highlight {
          background: linear-gradient(135deg, var(--teal), var(--indigo));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @media (max-width: 640px) { .hero-title { font-size: 2.5rem; } }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto 2.5rem;
        }
        @media (max-width: 640px) { .hero-subtitle { font-size: 1.1rem; } }

        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        @media (max-width: 480px) {
          .hero-actions { flex-direction: column; }
          .hero-actions .btn { width: 100%; }
        }

        .features-section {
          max-width: 1200px;
          width: 100%;
          padding: 2rem 0 6rem;
          position: relative;
          z-index: 10;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .features-grid { grid-template-columns: 1fr; } }

        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          border-color: var(--border-focus);
          box-shadow: var(--shadow-glow);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .feature-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .feature-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .landing-footer {
          border-top: 1px solid var(--border);
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        @media (max-width: 640px) {
          .landing-footer { flex-direction: column; gap: 1rem; text-align: center; }
        }
        .footer-links {
          display: flex;
          gap: 1.5rem;
        }
        .footer-links a {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
