import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

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

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,         // Gmail ของคุณ
      pass: process.env.GMAIL_APP_PASSWORD, // App password ที่สร้างจาก Google
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="color: #333; text-align: center;">🔐 Reset Your Password</h2>
          <p style="font-size: 16px; color: #444;">
            Hello, we received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
              style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Send mail error:", error);
    return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
