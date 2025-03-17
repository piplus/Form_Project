import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const formId = Number(params.id);
    if (isNaN(formId)) {
      return NextResponse.json({ error: "Invalid Form ID" }, { status: 400 });
    }

    // ✅ ดึงคำถามจากฟอร์ม
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { questions: true },
    });

    if (!form || !form.questions) {
      return NextResponse.json({ error: "Form not found or has no questions" }, { status: 404 });
    }

    // ✅ ตรวจสอบและแปลง questions เป็น JSON Object
    let questions;
    try {
      questions = JSON.parse(form.questions as string);
      if (!Array.isArray(questions)) {
        throw new Error("Invalid questions format");
      }
    } catch (error) {
      return NextResponse.json({ error: "Error parsing questions" }, { status: 500 });
    }

    // ✅ ดึงคำตอบจาก FormSubmission
    const submissions = await prisma.formSubmission.findMany({
      where: { formId },
      select: { userId: true, answers: true, createdAt: true },
    });

    // ✅ ตรวจสอบและแปลง answers
    const responses = submissions.map((submission) => {
      if (!submission.answers || typeof submission.answers !== "object") {
        return { userId: submission.userId, submittedAt: submission.createdAt.toISOString() };
      }
      return {
        userId: submission.userId,
        submittedAt: submission.createdAt.toISOString(),
        ...submission.answers, // ✅ Spread Operator ถูกต้อง
      };
    });

    return NextResponse.json({ questions, responses });
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);
    return NextResponse.json({ error: "Error fetching submissions" }, { status: 500 });
  }
}
