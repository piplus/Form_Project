import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();
export const runtime = "nodejs";

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
    console.log("📄 flatQuestions:", flatQuestions.map((q: any) => q.id));

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
      const parsed =
        typeof res.answers === "string"
          ? JSON.parse(res.answers || "{}")
          : res.answers || {};

      const baseRow = [
        res.user?.name || "",
        res.user?.email || "",
        new Date(res.createdAt).toLocaleString(),
        `Q${res.quarter || ""}`,
        res.year || "",
      ];

      worksheet.addRow([...baseRow, ...questionLabels.map(() => "")]);

      for (let i = 0; i < flatQuestions.length; i++) {
        const q = flatQuestions[i];
        // const colIdx = 6 + i;
        const rowIdx = r + 2;

        let colIdx = 6; // คอลัมน์เริ่มต้น
        for (const q of flatQuestions) {
          if (q.type === "date-range") {
            worksheet.getRow(rowIdx).getCell(colIdx).value = parsed[`${q.id}_start`] || parsed[q.id] || "-";
            worksheet.getRow(rowIdx).getCell(colIdx + 1).value = parsed[`${q.id}_end`] || "-";
            colIdx += 2;
          } else if (q.type === "file" && typeof parsed[q.id] === "string" && parsed[q.id].startsWith("data:image")) {
            // แนบรูป
            const base64 = parsed[q.id].split(",")[1];
            const ext = parsed[q.id].includes("jpeg") ? "jpeg" : "png";
            const buffer = Buffer.from(base64, "base64") as unknown as ExcelJS.Buffer;
            const imgId = workbook.addImage({ buffer, extension: ext });

            worksheet.addImage(imgId, {
              tl: { col: colIdx - 1, row: rowIdx - 1 },
              ext: { width: 100, height: 100 },
            });

            worksheet.getRow(rowIdx).getCell(colIdx).value = "🖼 แนบไฟล์ภาพ";
            colIdx += 1;
          } else {
            let value = parsed[q.id] ?? "-";
            if (typeof value === "string" && value.startsWith("อื่น") && parsed[`${q.id}_etc`]) {
              value = parsed[`${q.id}_etc`];
            }
            worksheet.getRow(rowIdx).getCell(colIdx).value = value;
            colIdx += 1;
          }
        }
      }
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