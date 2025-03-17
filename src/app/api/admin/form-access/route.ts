import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET: ดึงข้อมูล Form ที่ Role สามารถกรอกได้
export async function GET() {
  try {
    const roleAccess = await prisma.formAccess.findMany({
      include: { role: true, form: true },
    });
    return NextResponse.json(roleAccess);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching role access" }, { status: 500 });
  }
}

// ✅ POST: กำหนดให้ Role กรอกฟอร์มได้
export async function POST(req: Request) {
  try {
    const { roleId, formId } = await req.json();

    const existingAccess = await prisma.formAccess.findFirst({
      where: { roleId, formId },
    });

    if (existingAccess) {
      return NextResponse.json({ message: "Role already has access to this form" });
    }

    await prisma.formAccess.create({
      data: { roleId, formId },
    });

    return NextResponse.json({ message: "Form access granted" });
  } catch (error) {
    return NextResponse.json({ error: "Error updating access" }, { status: 500 });
  }
}

// ✅ DELETE: ลบสิทธิ์การเข้าถึง Form ของ Role
export async function DELETE(req: Request) {
  try {
    const { roleId, formId } = await req.json();

    await prisma.formAccess.deleteMany({
      where: { roleId, formId },
    });

    return NextResponse.json({ message: "Form access removed" });
  } catch (error) {
    return NextResponse.json({ error: "Error removing access" }, { status: 500 });
  }
}
