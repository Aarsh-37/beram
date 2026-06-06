import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, serverError } from "@/lib/api-helpers";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const [products, categories, movements] = await prisma.$transaction([
      prisma.product.findMany({
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
      }),
      prisma.stockMovement.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { product: { select: { name: true } } },
      }),
    ]);

    const totalProducts = products.length;
    const totalCategories = categories.length;
    const lowStockCount = products.filter(
      (p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold
    ).length;
    const outOfStockCount = products.filter((p) => p.quantity === 0).length;
    const totalStockValue = products.reduce(
      (sum, p) => sum + Number(p.price) * p.quantity,
      0
    );

    // Stock by category for bar chart
    const stockByCategory = categories.map((cat) => {
      const categoryProducts = products.filter((p) => p.categoryId === cat.id);
      const totalQty = categoryProducts.reduce((sum, p) => sum + p.quantity, 0);
      const totalValue = categoryProducts.reduce(
        (sum, p) => sum + Number(p.price) * p.quantity,
        0
      );
      return {
        name: cat.name,
        quantity: totalQty,
        value: totalValue,
        productCount: cat._count.products,
      };
    });

    return NextResponse.json({
      totalProducts,
      totalCategories,
      lowStockCount,
      outOfStockCount,
      totalStockValue,
      stockByCategory,
      recentMovements: movements,
    });
  } catch {
    return serverError();
  }
}
