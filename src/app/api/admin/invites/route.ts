import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const invites = await prisma.invite.findMany({
    include: { role: true },
    orderBy: { invitedAt: "desc" },
  });
  return NextResponse.json(invites);
}

export async function POST(req: Request) {
  const { email, roleId } = await req.json();
  if (!email || !roleId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const invite = await prisma.invite.create({
    data: { email, roleId },
  });

  return NextResponse.json(invite);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.invite.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
