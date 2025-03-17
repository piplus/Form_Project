"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ใช้ useEffect() สำหรับ Redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchForms() {
      if (!session?.user?.role) return;

      // ✅ ถ้าเป็น Admin ให้ Redirect ไปที่ /admin
      if (session.user.role === "admin") {
        router.push("/admin");
        return;
      }

      const res = await fetch(`/api/forms?role=${session.user.role}`);
      const data = await res.json();

      setForms(data.error ? [] : data);
      setLoading(false);
    }

    if (status === "authenticated") {
      fetchForms();
    }
  }, [session, status, router]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        {/* ✅ ปุ่ม Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <p className="mt-4 text-lg text-gray-800">
        Welcome, <strong>{session?.user?.name}</strong> ({session?.user?.role})
      </p>

      {forms.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-3 text-left text-gray-800">File</th>
                <th className="px-4 py-3 text-left text-gray-800">Status</th>
                <th className="px-4 py-3 text-left text-gray-800">Select Form</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr key={form.id} className="border-b text-gray-500">
                  <td className="px-4 py-3">{form.file}</td>
                  <td className="px-4 py-3">{form.status}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => router.push(`/form/${form.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center mt-10 text-red-500">
          ไม่มีฟอร์มที่คุณสามารถเข้าถึงได้
        </p>
      )}
    </div>
  );
}


