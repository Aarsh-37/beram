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

    const whereClause: any = {
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
    };

    if (status === "out") {
      whereClause.AND.push({ quantity: 0 });
    }

    let products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (status === "low") {
      products = products.filter((p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold);
    } else if (status === "in") {
      products = products.filter((p) => p.quantity > p.lowStockThreshold);
    }

    return NextResponse.json({
      data: products,
      total: products.length,
    });
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return unauthorized();

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0].message);

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
