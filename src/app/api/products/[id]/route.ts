import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, notFound, serverError } from "@/lib/api-helpers";
import { productSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        movements: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { createdBy: { select: { name: true } } },
        },
      },
    });
    if (!product) return notFound("Product not found");
    return NextResponse.json(product);
  } catch {
    return serverError();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return notFound("Product not found");

    // Check SKU uniqueness (excluding current product)
    const skuTaken = await prisma.product.findFirst({
      where: { sku: parsed.data.sku, NOT: { id } },
    });
    if (skuTaken) return badRequest("A product with this SKU already exists");

    const updated = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: { category: { select: { id: true, name: true } } },
    });
    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return notFound("Product not found");

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch {
    return serverError();
  }
}
