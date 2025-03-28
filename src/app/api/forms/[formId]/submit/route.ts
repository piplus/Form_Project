import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, context: { params: { formId: string } }) {
  try {
    const formId = parseInt(context.params.formId, 10);
    const { userId, answers, quarter } = await req.json();
    console.log("🧪 userId:", userId);
    console.log("🧪 answers:", answers);
    console.log("🧪 quarter:", quarter);
    console.log("🧪 formId:", formId);

    if (!userId || !answers || !quarter || isNaN(formId)) {
      return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 });
    }

    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const submission = await prisma.formSubmission.create({
      data: {
        formId,
        userId: Number(userId),
        quarter: Number(quarter),
        answers,
        status: "Submitted",
        lastSubmittedAt: new Date(),
      },
    });

    console.log("📌 New submission row created:", submission);
    return NextResponse.json({ message: "Form submitted successfully", submission });

  } catch (error) {
    console.error("❌ Error submitting form:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
