"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FormData {
  id: number;
  file: string;
  description?: string;
  status: string;
  attempt: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchForms() {
      if (!session?.user?.id) return;

      try {
        const res = await fetch(`/api/forms?userId=${session.user.id}`);
        const data = await res.json();
        setForms(data.error ? [] : data);
      } catch (error) {
        console.error("❌ Error loading forms:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") fetchForms();
  }, [session, status]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
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
              {forms.map((form) => {
                const cycleAttempt = form.attempt === 0 ? 0 : ((form.attempt - 1 + 4) % 4) + 1;
                return (
                  <tr key={form.id} className="border-b text-gray-600">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-black relative group">
                        {form.file}

                        {form.description && (
                          <div className="relative">
                            <img
                              src="https://cdn-icons-png.flaticon.com/128/11560/11560440.png"
                              alt="hint"
                              width={20}
                              className="cursor-pointer"
                            />
                            <div className="absolute z-10 top-6 left-0 w-64 p-3 bg-white border border-gray-300 rounded-md shadow-lg text-sm text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {form.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm mb-1">{form.status}</div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all"
                          style={{ width: `${(cycleAttempt / 4) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{cycleAttempt} / 4 times</div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/form/${form.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                );
              })}
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
