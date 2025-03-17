import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET: ดึงฟอร์มทั้งหมดในระบบ (สำหรับ Admin)
export async function GET() {
  try {
    const forms = await prisma.form.findMany();

    // ✅ แปลง questions จาก JSON -> Object
    const formattedForms = forms.map((form) => ({
      ...form,
      questions: JSON.parse(form.questions as string),
    }));

    return NextResponse.json(formattedForms);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching all forms" }, { status: 500 });
  }
}
