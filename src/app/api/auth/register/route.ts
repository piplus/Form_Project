import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // ✅ ตรวจสอบว่าอีเมลถูกใช้ไปแล้วหรือไม่
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "Email นี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // ✅ หาค่า roleId ของ "user" ถ้าไม่มีให้สร้าง
    let userRole = await prisma.role.findUnique({ where: { name: "user" } });

    if (!userRole) {
      userRole = await prisma.role.create({ data: { name: "user" } });
    }

    // ✅ เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ บันทึกผู้ใช้ใหม่ในฐานข้อมูล โดยกำหนด roleId
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: userRole.id, // 👈 กำหนด role เป็น "user"
      },
    });

    return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ", user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
