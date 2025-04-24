import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ ให้ Reviewer ดูได้ทุกฟอร์ม ไม่เช็ค roleName ใน FormAccess
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleName = searchParams.get("role");

    // ❌ ไม่ต้องเช็ค roleName ให้ reviewer ดูได้ทุกฟอร์ม
    if (!roleName || !roleName.startsWith("reviewer")) {
      return NextResponse.json({ error: "Missing or invalid role parameter" }, { status: 400 });
    }

    console.log("📌 Fetching all forms for reviewer:", roleName);

    // ✅ ดึง **ทุกฟอร์ม** ที่มีการส่งข้อมูล (FormSubmission)
    const forms = await prisma.form.findMany({
      include: {
        submissions: true, // ✅ ดึงข้อมูล FormSubmission ของแต่ละฟอร์ม
      },
    });

    console.log("✅ Total forms found:", forms.length);
    return NextResponse.json(forms);
  } catch (error) {
    console.error("❌ Error fetching reviewer forms:", error);
    return NextResponse.json({ error: "Error fetching reviewer forms" }, { status: 500 });
  }
}
