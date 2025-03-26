import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, context: { params: { formId: string } }) {
  try {
    const formId = parseInt(context.params.formId, 10);
    const { userId, answers } = await req.json();

    if (!userId || !answers || isNaN(formId)) {
      return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 });
    }

    // ✅ ตรวจสอบว่าฟอร์มมีอยู่จริง
    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // ✅ หา submission ล่าสุดของ user นี้ → เพื่อดูว่า attempt ล่าสุดคือเท่าไหร่
    const latest = await prisma.formSubmission.findFirst({
      where: { formId, userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });

    const nextAttempt = latest ? latest.attempt + 1 : 1;

    // ✅ เพิ่ม Row ใหม่ทุกครั้ง
    const created = await prisma.formSubmission.create({
      data: {
        formId,
        userId: Number(userId),
        answers,
        attempt: nextAttempt,
        status: nextAttempt >= 4 ? "Completed" : latest ? "Updated" : "Submitted",
        lastSubmittedAt: new Date(),
      },
    });

    console.log("📌 New submission row created:", created);
    return NextResponse.json({ message: "Form submitted successfully", submission: created });

  } catch (error) {
    console.error("❌ Error submitting form:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
