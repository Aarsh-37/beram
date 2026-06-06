import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, notFound, serverError } from "@/lib/api-helpers";
import { stockMovementSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { productId } = await params;
    const body = await req.json();
    const parsed = stockMovementSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0].message);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return notFound("Product not found");

    const { type, quantity, reason } = parsed.data;

    // Prevent negative stock
    if (type === "OUT" && product.quantity < quantity) {
      return badRequest(
        `Cannot remove ${quantity} units — only ${product.quantity} in stock`
      );
    }

    const newQuantity =
      type === "IN" ? product.quantity + quantity : product.quantity - quantity;

    // Run update + movement creation in a transaction
    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { quantity: newQuantity },
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          reason,
          createdById: user.sub,
        },
        include: { createdBy: { select: { name: true } } },
      }),
    ]);

    return NextResponse.json({ product: updatedProduct, movement }, { status: 201 });
  } catch {
    return serverError();
  }
}
