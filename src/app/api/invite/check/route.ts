import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const invite = await prisma.invite.findUnique({
    where: { email },
  });

  if (!invite || invite.used) {
    return NextResponse.json(null); // invite not found or used
  }

  return NextResponse.json({ roleId: invite.roleId });
}