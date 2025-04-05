import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const logs = await prisma.exportLog.findMany({
    orderBy: { exportedAt: "desc" },
    include: {
      user: true,
      form: true,
    },
  });

  return NextResponse.json(logs);
}