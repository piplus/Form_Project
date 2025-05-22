import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET: ดึงข้อมูล Submission ของฟอร์มที่ Reviewer สามารถเข้าถึง
export async function GET(req: Request, context: any) {
  try {
    const formIdString = context.params?.formId;
    if (!formIdString) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    const formId = parseInt(formIdString, 10);
    if (isNaN(formId)) {
      return NextResponse.json({ error: "Invalid Form ID" }, { status: 400 });
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        submissions: {
          include: { user: true },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const questions = JSON.parse(form.questions as string);
    const responses = form.submissions.map((submission) => ({
      user: submission.user.name,
      email: submission.user.email,
      createdAt: submission.createdAt,
      quarter: submission.quarter,
      year: submission.year,
      answers: submission.answers,
    }));

    return NextResponse.json({ questions, responses });
  } catch (error) {
    console.error("❌ Error fetching form submissions:", error);
    return NextResponse.json({ error: "Error fetching form submissions" }, { status: 500 });
  }
}
