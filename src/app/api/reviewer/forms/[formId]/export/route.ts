export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Buffer as NodeBuffer } from "node:buffer";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { formId: string } }) {
  try {
    const formId = Number(params.formId);
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

    // const questions = JSON.parse(form.questions || "[]");
    const rawQuestions = form.questions;
    const questions = typeof rawQuestions === "string" ? JSON.parse(rawQuestions) : rawQuestions;

    const responses = form.submissions || [];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Responses");

    const questionLabels = questions.flatMap((q: any) =>
      q.type === "group" && q.children
        ? q.children.map((c: any) => c.label)
        : [q.label]
    );
    const headers = ["User Name", "User Email", "Submitted At", "Quarter", "Year", ...questionLabels];
    worksheet.addRow(headers);

    for (let r = 0; r < responses.length; r++) {
      const res = responses[r];
      const parsed = typeof res.answers === "string" ? JSON.parse(res.answers || "{}") : res.answers || {};

      const baseRow = [
        res.user?.name || "",
        res.user?.email || "",
        new Date(res.createdAt).toLocaleString(),
        `Q${res.quarter || ""}`,    // ✅ เปลี่ยนจาก res.status?.quarter
        res.year || "",             // ✅ เปลี่ยนจาก res.status?.year
      ];

      const row = worksheet.addRow([
        ...baseRow,
        ...questionLabels.map(() => "")
      ]);

      for (let i = 0; i < questionLabels.length; i++) {
        const label = questionLabels[i];
        const id =
          questions.find((q: any) => q.label === label)?.id ||
          questions.flatMap((q: any) => q.children || []).find((c: any) => c.label === label)?.id;

        const val = parsed[id] || "";
        const colIdx = 6 + i;

        if (typeof val === "string" && val.startsWith("data:image")) {

          const base64 = val.split(",")[1];
          const ext = val.includes("jpeg") ? "jpeg" : "png";

          const buffer = Buffer.from(base64, "base64") as unknown as ExcelJS.Buffer;

          const imgId = workbook.addImage({
            buffer,
            extension: ext,
          });

          worksheet.addImage(imgId, {
            tl: { col: colIdx - 1, row: r + 1 },
            ext: { width: 100, height: 100 },
          });
        } else {
          worksheet.getRow(r + 2).getCell(colIdx).value = val;
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

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
