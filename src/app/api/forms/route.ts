import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const role = session.user.role;

  const formAccess = await prisma.formAccess.findMany({
    where: { role: { name: role } },
    include: { form: true },
  });

  const result = await Promise.all(
    formAccess.map(async (access) => {
      const allSubmissions = await prisma.formSubmission.findMany({
        where: { formId: access.formId, userId },
      });

      const submittedQuarters = [...new Set(allSubmissions.map((s) => s.quarter))];

      return {
        id: access.form.id,
        file: access.form.file,
        description: access.form.description,
        submittedQuarters,
      };
    })
  );

  return NextResponse.json(result);
}
