import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "./client-layout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ เพิ่ม icons เข้า metadata
export const metadata: Metadata = {
  title: "E-GEB - เก็บให้ครบ ไม่หลง ไม่ลืม ไม่พลาดข้อมูลสำคัญ",
  description: "Engineering Governance and Evidence-Based Platform",
  icons: {
    icon: "/LOGO 1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
