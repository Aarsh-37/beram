import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, notFound, serverError, badRequest } from "@/lib/api-helpers";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    
    // Prevent an admin from changing their own role to STAFF
    if (user.sub === id) {
      return badRequest("You cannot change your own role.");
    }

    const body = await req.json();
    const { role } = body;

    if (role !== "ADMIN" && role !== "STAFF") {
      return badRequest("Invalid role");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFound("User not found");

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
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

    // Prevent an admin from deleting themselves
    if (user.sub === id) {
      return badRequest("You cannot delete your own account.");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFound("User not found");

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch {
    return serverError();
  }
}
