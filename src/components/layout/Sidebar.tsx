"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: "/products",
    label: "Products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 3H8L6 7h12l-2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/categories",
    label: "Categories",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/movements",
    label: "Stock History",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="sidebar-hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" fill="currentColor" opacity="0.3"/>
              <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M16 3H8L6 7h12l-2-4z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="sidebar-logo-text">StockPilot</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          {mounted && (
            <button
              className="sidebar-export"
              style={{ marginBottom: "0.25rem" }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          )}
          <a
            href="/api/export"
            className="sidebar-export"
            download
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 20h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Export CSV
          </a>
          <button
            className="sidebar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar-hamburger {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 200;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sidebar-hamburger:hover { background: var(--bg-card-hover); }
        @media (max-width: 768px) { .sidebar-hamburger { display: flex; } }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 99;
          backdrop-filter: blur(2px);
        }
        @media (max-width: 768px) { .sidebar-overlay { display: block; } }

        .sidebar {
          width: 240px;
          min-width: 240px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -260px;
            top: 0;
            z-index: 100;
            transition: left 0.3s ease;
            box-shadow: 4px 0 24px rgba(0,0,0,0.5);
          }
          .sidebar.sidebar-open { left: 0; }
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem 1.25rem 1.25rem;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--teal), var(--indigo));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .sidebar-logo-text {
          font-size: 1.125rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--teal), var(--indigo));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.875rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .sidebar-link:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }
        .sidebar-link-active {
          background: var(--teal-glow);
          color: var(--teal) !important;
          border: 1px solid rgba(6,182,212,0.2);
        }
        .sidebar-link-icon { display: flex; align-items: center; }

        .sidebar-bottom {
          padding: 1rem 0.75rem;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sidebar-export {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.6rem 0.875rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s;
          border: 1px solid var(--border);
        }
        .sidebar-export:hover { background: var(--bg-card-hover); color: var(--green); border-color: rgba(16,185,129,0.3); }
        .sidebar-logout {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.6rem 0.875rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 500;
          background: none;
          border: 1px solid var(--border);
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
          width: 100%;
        }
        .sidebar-logout:hover:not(:disabled) { background: var(--red-glow); color: #fca5a5; border-color: rgba(239,68,68,0.3); }
        .sidebar-logout:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </>
  );
}
