import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, serverError } from "@/lib/api-helpers";
import { categorySchema } from "@/lib/validations";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json(categories);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0].message);

    const existing = await prisma.category.findUnique({
      where: { name: parsed.data.name },
    });
    if (existing) return badRequest("Category already exists");

    const category = await prisma.category.create({ data: parsed.data });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return serverError();
  }
}
