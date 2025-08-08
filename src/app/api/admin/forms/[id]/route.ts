// src/app/api/admin/forms/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: any) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const formId = parseInt(params.id);
  const { file } = await req.json();

  const updated = await prisma.form.update({
    where: { id: formId },
    data: { file },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: any) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const formId = parseInt(params.id);

  try {
    await prisma.formAccess.deleteMany({ where: { formId } });
    await prisma.formSubmission.deleteMany({ where: { formId } });
    await prisma.exportLog.deleteMany({ where: { formId } });
    await prisma.invite.deleteMany({ where: { formId } });

    await prisma.form.delete({ where: { id: formId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Delete Form Error:", error);
    return NextResponse.json({ error: "Error deleting form" }, { status: 500 });
  }
}
