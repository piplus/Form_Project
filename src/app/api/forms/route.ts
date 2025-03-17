import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET: ดึงเฉพาะฟอร์มที่ Role นั้นมีสิทธิ์เข้าถึง และแปลง JSON questions กลับเป็น Object
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleName = searchParams.get("role");

    if (!roleName) {
      return NextResponse.json({ error: "Missing role parameter" }, { status: 400 });
    }

    // ✅ ค้นหา Role และดึงเฉพาะฟอร์มที่ Role นั้นมีสิทธิ์เข้าถึง
    const role = await prisma.role.findUnique({
      where: { name: roleName },
      include: { formAccess: { include: { form: true } } },
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // ✅ แปลง questions จาก JSON -> Object ก่อนส่งให้ Frontend
    const forms = role.formAccess.map((access) => ({
      ...access.form,
      questions: JSON.parse(access.form.questions as string),
    }));

    return NextResponse.json(forms);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching forms" }, { status: 500 });
  }
}
