import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY); // ต้องตั้งไว้ใน .env

export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ message: "This email is not registered." }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 ชั่วโมง

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: expires,
    },
  });

  const resetLink = `http://egeb-en.rmutt.ac.th/reset-password/${token}`;

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Password Reset',
    html: `<p>Click to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
  });

  return NextResponse.json({ ok: true });
}