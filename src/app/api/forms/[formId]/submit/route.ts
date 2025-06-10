import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendFormEmail } from "@/lib/mailer";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const formId = parseInt(url.pathname.split("/").slice(-2)[0], 10); // ดึง [formId] จาก URL

    const { userId, answers, quarter, year } = await req.json();

    if (!userId || !answers || !quarter || !year || isNaN(formId)) {
      return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 });
    }

    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const submission = await prisma.formSubmission.create({
      data: {
        formId,
        userId: Number(userId),
        quarter: Number(quarter),
        year,
        answers,
        status: "Submitted",
        lastSubmittedAt: new Date(),
      },
    });

    const questions = typeof form.questions === "string"
      ? JSON.parse(form.questions)
      : Array.isArray(form.questions)
        ? form.questions
        : [];

    const rendered = questions.map((q: any) => {
      if (q.type === "group" && q.children?.length) {
        return `
          <h3>${q.label}</h3>
          <ul>${q.children
            .map((c: any) => {
              if (c.type === "date-range") {
                const start = answers[`${c.id}_start`] || "-";
                const end = answers[`${c.id}_end`] || "-";
                return `<li><b>${c.label}:</b> ${start} - ${end}</li>`;
              }
              return `<li><b>${c.label}:</b> ${answers[c.id] || "-"}</li>`;
            })
            .join("")}
          </ul>
        `;
      }

      if (q.type === "date-range") {
        const start = answers[`${q.id}_start`] || "-";
        const end = answers[`${q.id}_end`] || "-";
        return `<p><b>${q.label}:</b> ${start} - ${end}</p>`;
      }

      return `<p><b>${q.label}:</b> ${answers[q.id] || "-"}</p>`;
    });

    const emailHtml = `
      <h2>📋 คุณได้ส่งฟอร์มเรียบร้อยแล้ว</h2>
      <p><b>ฟอร์ม:</b> ${form.file}</p>
      <p><b>ปี:</b> ${year} | <b>ไตรมาส:</b> ${quarter}</p>
      <hr />
      ${rendered.join("")}
    `;

    await sendFormEmail(user.email, `📨 ฟอร์มของคุณ: ${form.file}`, emailHtml);

    return NextResponse.json({ message: "Form submitted successfully", submission });
  } catch (error) {
    console.error("❌ Error submitting form:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
