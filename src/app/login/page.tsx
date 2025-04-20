"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600'] });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    try {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const userRole = session?.user?.role;

      if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole?.startsWith("form_reviewer_")) {
        router.push("/reviewer-dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("❌ Error fetching session:", error);
      setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    }
  };

  return (
    <div className={`flex min-h-screen ${poppins.className}`}>
      {/* Left Section */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gray-100 p-12 space-y-6">
        <Image
          src="/LOGO 2.png"
          alt="E-Kept Logo"
          width={280}
          height={280}
          className="object-contain"
        />

        <div className="text-center text-gray-800 space-y-2 max-w-md">
          <h2 className="text-3xl font-semibold">E-GEB</h2>
          <p className="text-sm italic text-gray-600">
            Engineering Governance and Evidence-Based Platform
          </p>
          <p className="text-sm leading-relaxed text-gray-600">
            แพลตฟอร์มสำหรับการบริหารจัดการข้อมูลอย่างมีหลักฐานและเป็นระบบ <br />
            พัฒนาโดยฝ่ายบริหารและวางแผน คณะวิศวกรรมศาสตร์ (2025)
          </p>
          <p className="text-sm font-semibold text-blue-700">
            อีเก็บ – เก็บให้ครบ ไม่หลง ไม่ลืม ไม่พลาดข้อมูลสำคัญ
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col justify-center items-center bg-white w-full lg:w-1/2 p-8">
        <div className="w-full max-w-md shadow-md border border-gray-100 rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Login</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700">E-mail</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full p-3 mt-1 border rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 mt-1 border rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-black text-white rounded-md hover:bg-gray-900 transition-all"
            >
              Sign In
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-blue-600 hover:underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
