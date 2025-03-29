"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // 👈 เพิ่มบรรทัดนี้

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
      // ✅ ดึงข้อมูล session หลังจาก Login
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      console.log("📌 User Session:", session);

      // ✅ ดึง Role ของ User
      const userRole = session?.user?.role;

      // ✅ ถ้าเป็น "admin" → ไปหน้า Admin
      if (userRole === "admin") {
        router.push("/admin");
      }
      // ✅ ถ้า Role เริ่มต้นด้วย "form_reviewer_" → ไป reviewer_dashboard
      else if (userRole?.startsWith("form_reviewer_")) {
        router.push("/reviewer-dashboard");
      }
      // ✅ ถ้าเป็น User ปกติ → ไปหน้า Dashboard
      else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("❌ Error fetching session:", error);
      setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gray-200 p-10">
        <Image
          src="/weblogo.png"
          alt="E-Kept Logo"
          width={500}
          height={500}
          className="object-contain mb-4"
        />
      </div>
      
      {/* Right Section */}
      <div className="flex flex-col justify-center items-center bg-white w-full lg:w-1/2 p-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-gray-600">E-mail</label>
            <input
              type="email"
              placeholder="Type your e-mail"
              className="w-full p-3 border rounded-md bg-gray-100 text-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Type your password"
              className="w-full p-3 border rounded-md bg-gray-100 text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 text-white bg-black rounded-md hover:bg-gray-900 transition"
          >
            Sign In
          </button>
        </form>

        {/* ✅ ปุ่มไป Register */}
        <p className="mt-4 text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/register" className="font-bold text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
