import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET: ดึง **ทุกฟอร์ม** ที่อยู่ในระบบ
export async function GET() {
  try {
    // ✅ ดึงทุกฟอร์ม พร้อมข้อมูลการส่งฟอร์ม (FormSubmissions)
    const forms = await prisma.form.findMany({
      include: {
        submissions: true, // ดึงข้อมูลการส่งฟอร์ม
      },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("❌ Error fetching all forms for reviewer:", error);
    return NextResponse.json({ error: "Error fetching forms" }, { status: 500 });
  }
}
