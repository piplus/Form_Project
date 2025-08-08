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
  try {
    const { id } = await req.json();

    // ลบข้อมูลที่เกี่ยวข้องกับ user ก่อน
    await prisma.formSubmission.deleteMany({ where: { userId: id } });
    await prisma.exportLog.deleteMany({ where: { userId: id } });

    // ลบ user
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}