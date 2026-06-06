import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [movements, total] = await prisma.$transaction([
      prisma.stockMovement.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          createdBy: { select: { name: true } },
        },
      }),
      prisma.stockMovement.count(),
    ]);

    return NextResponse.json({
      movements,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return serverError();
  }
}
