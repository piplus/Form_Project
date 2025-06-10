// src/app/api/reviewer/forms/[formId]/export/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: any) {
  try {
    const formId = Number(params.formId);
    const url = new URL(req.url);
    const yearFilter = url.searchParams.get("year");

    if (isNaN(formId)) {
      return NextResponse.json({ error: "Invalid Form ID" }, { status: 400 });
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        submissions: {
          include: { user: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const rawQuestions = form.questions;
    const questions = typeof rawQuestions === "string" ? JSON.parse(rawQuestions) : rawQuestions;

    let responses = form.submissions || [];

    if (yearFilter) {
      const targetYear = parseInt(yearFilter);
      if (!isNaN(targetYear)) {
        responses = responses.filter((res) => res.year === targetYear);
      }
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Responses");

    const flatQuestions = questions.flatMap((q: any) =>
      q.type === "group" && Array.isArray(q.children)
        ? q.children.map((c: any) => ({ ...c, groupLabel: q.label }))
        : [q]
    );

    const questionLabels = flatQuestions.flatMap((q: any) =>
      q.type === "date-range"
        ? [`${q.label} (เริ่ม)`, `${q.label} (สิ้นสุด)`]
        : [q.label]
    );

    worksheet.addRow([
      "User Name",
      "User Email",
      "Submitted At",
      "Quarter",
      "Year",
      ...questionLabels,
    ]);

    for (let r = 0; r < responses.length; r++) {
      const res = responses[r];
      const parsed = typeof res.answers === "string" ? JSON.parse(res.answers || "{}") : res.answers || {};

      const rowData = [
        res.user?.name || "",
        res.user?.email || "",
        new Date(res.createdAt).toLocaleString(),
        `Q${res.quarter || ""}`,
        res.year || "",
      ];

     flatQuestions.forEach((q: any) => {
      if (q.type === "date-range") {
        const start = parsed[`${q.id}_start`] || parsed[q.id]; // fallback จากข้อมูลเก่า
        const end = parsed[`${q.id}_end`];

        rowData.push(start || "-");
        rowData.push(end || "-");
      } else if (
        q.type === "file" &&
        typeof parsed[q.id] === "string" &&
        parsed[q.id].startsWith("data:image")
      ) {
        rowData.push("🖼 แนบไฟล์ภาพ");
      } else {
        let val = parsed[q.id] || "-";
        if (typeof val === "string" && val.startsWith("อื่น") && parsed[`${q.id}_etc`]) {
          val = parsed[`${q.id}_etc`];
        }
        rowData.push(val);
      }
    });


      worksheet.addRow(rowData);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=form_${formId}${yearFilter ? `_year_${yearFilter}` : ""}.xlsx`,
      },
    });
  } catch (error) {
    console.error("❌ Error exporting Excel:", error);
    return NextResponse.json({ error: "Error exporting Excel" }, { status: 500 });
  }
}
