import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, context: { params: { formId: string } }) {
  try {
    console.log("📌 API: Form Submission Request Received");

    const formId = parseInt(context.params.formId, 10);
    console.log("📌 API: formId", formId);

    const { userId, answers } = await req.json();
    console.log("📌 API: userId", userId);
    console.log("📌 API: answers", answers);

    if (!userId || !answers) {
      return NextResponse.json({ error: "Missing userId or answers" }, { status: 400 });
    }

    // ตรวจสอบว่าฟอร์มมีอยู่จริง
    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // บันทึกข้อมูลลง Database
    const submission = await prisma.formSubmission.create({
      data: {
        formId,
        userId: Number(userId), // ✅ แปลงเป็น Number
        answers,
        status: "Submitted",
      },
    });
    

    console.log("📌 API: Form submitted successfully", submission);
    return NextResponse.json({ message: "Form submitted successfully", submission }, { status: 201 });

  } catch (error) {
    console.error("❌ API: Error submitting form:", error);
    return NextResponse.json({ error: "Error submitting form" }, { status: 500 });
  }
}
