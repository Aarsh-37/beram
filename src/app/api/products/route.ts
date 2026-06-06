import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, serverError } from "@/lib/api-helpers";
import { productSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || ""; // "low" | "out" | "in"

    const products = await prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { sku: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          categoryId ? { categoryId } : {},
        ],
      },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by stock status in memory (avoids complex Prisma field comparison)
    const filtered = products.filter((p) => {
      if (status === "out") return p.quantity === 0;
      if (status === "low") return p.quantity > 0 && p.quantity <= p.lowStockThreshold;
      if (status === "in") return p.quantity > p.lowStockThreshold;
      return true;
    });

    return NextResponse.json(filtered);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const skuTaken = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
    if (skuTaken) return badRequest("A product with this SKU already exists");

    const product = await prisma.product.create({
      data: { ...parsed.data, createdById: user.sub },
      include: { category: { select: { id: true, name: true } } },
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return serverError();
  }
}
