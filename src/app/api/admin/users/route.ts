import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET: ดึง Users ทั้งหมด
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}

// ✅ PATCH: เปลี่ยน Role ของ User
export async function PATCH(req: Request) {
  try {
    const { userId, roleId } = await req.json();
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });
    return NextResponse.json({ message: "Role updated", user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Error updating role" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
