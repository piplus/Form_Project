import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET: ดึง Roles ทั้งหมด
export async function GET() {
  try {
    const roles = await prisma.role.findMany();
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching roles" }, { status: 500 });
  }
}

// ✅ POST: กำหนดสิทธิ์ให้ Role ใช้ฟอร์มได้
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
