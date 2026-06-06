import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflowX: "hidden",
          background: "var(--bg-primary)",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
