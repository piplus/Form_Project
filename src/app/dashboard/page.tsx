"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface FormData {
  id: number;
  file: string;
  description?: string;
  submittedQuarters: number[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    async function fetchForms() {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/forms?userId=${session.user.id}`);
      const data = await res.json();
      const sorted = [...data].sort((a, b) =>
        a.file.localeCompare(b.file, undefined, { numeric: true })
      );
      setForms(data.error ? [] : sorted);
      setLoading(false);
    }

    if (status === "authenticated") fetchForms();
  }, [session, status]);

  const handleOpenModal = (formId: number) => {
    setSelectedFormId(formId);
    setShowModal(true);
  };

  const handleSelectQuarter = (quarter: number) => {
    if (selectedFormId) {
      router.push(`/form/${selectedFormId}?quarter=${quarter}`);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Navigation Bar */}
      <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/weblogo2.png" alt="E-Kept Logo" width={200} height={0} />
          {/* <span className="text-xl font-bold text-gray-800">E-Kept</span> */}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">
            👋 {session?.user?.name} ({session?.user?.role})
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ✅ Main Section */}
      <main className="p-6 md:p-10">
        {forms.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-800">File</th>
                  <th className="px-4 py-3 text-left text-gray-800">Progress</th>
                  <th className="px-4 py-3 text-left text-gray-800">Select Form</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id} className="border-b text-gray-700">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      {form.file}
                      {form.description && (
                        <div className="relative group">
                          <img
                            src="https://cdn-icons-png.flaticon.com/128/11560/11560440.png"
                            alt="hint"
                            width={18}
                            className="cursor-pointer"
                          />
                          <div className="absolute z-10 top-6 left-0 w-64 p-3 bg-white border border-gray-300 rounded-md shadow-md text-sm text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {form.description}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((q) => (
                          <div
                            key={q}
                            className={`w-6 h-6 rounded-full ${
                              form.submittedQuarters?.includes(q)
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                            title={`Quarter ${q}`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Submitted: {(form.submittedQuarters ?? []).join(", ") || "None"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOpenModal(form.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Select Form
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center mt-10 text-red-500">ไม่มีฟอร์มที่คุณสามารถเข้าถึงได้</p>
        )}
      </main>

      {/* ✅ Modal */}
      {showModal && selectedFormId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-96 p-6 text-center animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4">เลือกไตรมาสที่จะกรอก</h2>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((q) => {
                const form = forms.find((f) => f.id === selectedFormId);
                const isSubmitted = form?.submittedQuarters.includes(q);

                return (
                  <button
                    key={q}
                    onClick={() => handleSelectQuarter(q)}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border text-sm font-medium transition-all duration-200
                      ${isSubmitted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-500 hover:text-white"}
                    `}
                  >
                    <span className="text-lg font-semibold">Quarter {q}</span>
                    {isSubmitted && <span className="text-xs mt-1">เคยส่งแล้ว ✅</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 text-sm text-gray-500 hover:underline"
            >
              ❌ ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
