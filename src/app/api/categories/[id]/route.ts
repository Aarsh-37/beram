import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, notFound, serverError } from "@/lib/api-helpers";
import { categorySchema } from "@/lib/validations";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return notFound("Category not found");

    const nameTaken = await prisma.category.findFirst({
      where: { name: parsed.data.name, NOT: { id } },
    });
    if (nameTaken) return badRequest("Category name already in use");

    const updated = await prisma.category.update({
      where: { id },
      data: parsed.data,
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
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) return notFound("Category not found");

    if (existing._count.products > 0) {
      return badRequest(
        `Cannot delete — ${existing._count.products} product(s) still assigned to this category`
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted" });
  } catch {
    return serverError();
  }
}
