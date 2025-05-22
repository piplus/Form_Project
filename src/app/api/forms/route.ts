import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url); // ✅ อ่าน query param
  const yearParam = url.searchParams.get("year");
  const targetYear = parseInt(yearParam || "") || new Date().getFullYear(); // fallback ปีปัจจุบัน

  const userId = parseInt(session.user.id);
  const role = session.user.role;

  const formAccess = await prisma.formAccess.findMany({
    where: { role: { name: role } },
    include: { form: true },
  });

  const result = await Promise.all(
    formAccess.map(async (access) => {
      const submissions = await prisma.formSubmission.findMany({
        where: {
          formId: access.form.id,
          userId,
        },
        select: {
          year: true,
          quarter: true,
        },
      });
  
      return {
        id: access.form.id,
        file: access.form.file,
        description: access.form.description,
        submissions,
      };
    })
  );

  return NextResponse.json(result);
}
