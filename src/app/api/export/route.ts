import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const products = await prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { name: "asc" },
    });

    const headers = ["Name", "SKU", "Category", "Price", "Quantity", "Low Stock Threshold", "Status", "Created At"];
    const rows = products.map((p) => {
      const status =
        p.quantity === 0
          ? "Out of Stock"
          : p.quantity <= p.lowStockThreshold
          ? "Low Stock"
          : "In Stock";
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku,
        `"${p.category.name.replace(/"/g, '""')}"`,
        p.price.toString(),
        p.quantity.toString(),
        p.lowStockThreshold.toString(),
        status,
        new Date(p.createdAt).toISOString(),
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="inventra-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch {
    return serverError();
  }
}
