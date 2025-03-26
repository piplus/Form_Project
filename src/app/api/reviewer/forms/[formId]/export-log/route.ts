import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { formId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formId = parseInt(params.formId);
  if (isNaN(formId)) {
    return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
  }

  try {
    const log = await prisma.exportLog.create({
      data: {
        userId: parseInt(session.user.id),
        formId,
      },
    });

    return NextResponse.json({ message: "Export logged", log });
  } catch (error) {
    console.error("❌ Error logging export:", error);
    return NextResponse.json({ error: "Export logging failed" }, { status: 500 });
  }
}
