// file: src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // ตรวจสอบว่า user มีอยู่แล้วหรือไม่
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email นี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // ตรวจสอบว่าอีเมลนี้ถูกเชิญหรือไม่
    const invite = await prisma.invite.findUnique({ where: { email } });

    if (!invite || invite.used) {
      return NextResponse.json({ error: "ไม่พบคำเชิญสำหรับอีเมลนี้ หรือถูกใช้ไปแล้ว" }, { status: 403 });
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ใหม่
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: invite.roleId,
      },
    });

    // อัปเดต invite ว่าใช้แล้ว
    await prisma.invite.update({
      where: { email },
      data: { used: true },
    });

    return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ", user: newUser }, { status: 201 });

  } catch (error) {
    console.error("❌ Error in register API:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
