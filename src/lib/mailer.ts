// lib/mailer.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendFormEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"E-GEB แจ้งเตือน" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}