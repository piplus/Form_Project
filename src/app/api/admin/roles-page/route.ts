import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// ดึงทั้งหมด
export async function GET() {
  const roles = await prisma.role.findMany();
  return NextResponse.json(roles);
}

// สร้างใหม่
export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const newRole = await prisma.role.create({ data: { name } });
  return NextResponse.json(newRole);
}

// แก้ไข
export async function PUT(req: NextRequest) {
    const { id, name } = await req.json();
  
    // ✅ Ensure id is a number
    const parsedId = parseInt(id);
  
    const updated = await prisma.role.update({
      where: { id: parsedId },
      data: { name },
    });
  
    return NextResponse.json(updated);
  }

// ลบ
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.role.delete({ where: { id } });
  return NextResponse.json({ success: true });
}