import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const formId = Number(url.pathname.split("/").pop());

    if (isNaN(formId)) {
      return NextResponse.json({ error: "Invalid Form ID" }, { status: 400 });
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // ✅ แปลง `questions` กลับเป็น JSON Object
    return NextResponse.json({
      ...form,
      questions: form.questions ? JSON.parse(form.questions as string) : [],
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json({ error: "Error fetching form" }, { status: 500 });
  }
}
