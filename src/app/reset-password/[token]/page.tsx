"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("");

    if (password.length < 6) {
      return setError("Password should be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: params.token, password }),
      headers: { "Content-Type": "application/json" },
    });

    setLoading(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError("❌ รีเซ็ตรหัสผ่านไม่สำเร็จ หรือ token หมดอายุ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">🔐 Reset Password</h1>

        {done ? (
          <p className="text-center text-green-600">
            ✅ เปลี่ยนรหัสผ่านสำเร็จ กำลังกลับไปหน้า Login...
          </p>
        ) : (
          <>
            <label className="block text-gray-600 mb-1 text-sm">New Password</label>
            <input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <label className="block text-gray-600 mb-1 text-sm">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              onClick={handleReset}
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Reset"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
