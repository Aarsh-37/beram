import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockPilot — Inventory Management",
  description:
    "StockPilot is a real-time inventory management system. Track products, manage stock levels, and monitor low stock alerts from one beautiful dashboard.",
  keywords: ["inventory", "stock management", "products", "warehouse"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
