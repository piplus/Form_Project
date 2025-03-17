import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { formId: string } }) {
  try {
    const formId = Number(params.formId);
    if (isNaN(formId)) {
      return NextResponse.json({ error: "Invalid Form ID" }, { status: 400 });
    }

    console.log("📌 Fetching form ID:", formId);

    // ✅ ดึงข้อมูลฟอร์มและคำตอบที่ถูกส่ง
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        submissions: true,
      },
    });

    if (!form) {
      console.error("❌ Form not found");
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    console.log("✅ Form Data:", form);

    const questions = JSON.parse(form.questions as any);
    const responses = form.submissions.map((submission) => ({
      id: submission.id,
      userId: submission.userId,
      status: submission.status,
      answers: JSON.stringify(submission.answers), // 🔥 แก้ JSON
      createdAt: submission.createdAt,
    }));

    console.log("✅ Questions:", questions);
    console.log("✅ Responses:", responses);

    // ✅ แปลงข้อมูลเป็น Sheet
    const questionsSheet = XLSX.utils.json_to_sheet(questions);
    const responsesSheet = XLSX.utils.json_to_sheet(responses);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, questionsSheet, "Questions");
    XLSX.utils.book_append_sheet(wb, responsesSheet, "Responses");

    // ✅ แปลง Workbook เป็น Buffer
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    console.log("📌 Exporting Excel File...");

    // ✅ ส่งไฟล์เป็น Binary Response
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=form_${formId}.xlsx`,
      },
    });
  } catch (error) {
    console.error("❌ Error exporting Excel:", error);
    return NextResponse.json({ error: "Error exporting Excel" }, { status: 500 });
  }
}
