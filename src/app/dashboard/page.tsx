"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface FormData {
  id: number;
  file: string;
  description?: string;
  submissions: { year: number; quarter: number }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const savedYear = localStorage.getItem(`dashboard-year-${session.user.id}`);
    if (savedYear) {
      setSelectedYear(parseInt(savedYear));
    }
  }, [session?.user?.id]);

  useEffect(() => {
    async function fetchForms() {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/forms?userId=${session.user.id}&year=${selectedYear}`);
      const data = await res.json();
      setForms(data.error ? [] : data);
      setLoading(false);
    }

    if (status === "authenticated") {
      setLoading(true);
      fetchForms();
    }
  }, [session, status, selectedYear]);

  const handleOpenModal = (formId: number) => {
    setSelectedFormId(formId);
    setShowModal(true);
  };

  const handleSelectQuarter = (quarter: number) => {
    if (selectedFormId) {
      // router.push(`/form/${selectedFormId}?quarter=${quarter}`);
      router.push(`/form/${selectedFormId}?quarter=${quarter}&year=${selectedYear}`);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    if (session?.user?.id) {
      localStorage.setItem(`dashboard-year-${session.user.id}`, year.toString());
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/weblogo2.png" alt="Logo" width={200} height={0} />
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

      <main className="p-6 md:p-10">
        <div className="flex justify-end mb-4">
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className="border rounded-md p-2 text-gray-600"
        >
            {years.map((year) => (
              <option key={year} value={year}>
                ปี {year}
              </option>
            ))}
          </select>
        </div>

        {forms.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-visible">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">File</th>
                  <th className="px-4 py-3 text-left text-gray-600">Progress</th>
                  <th className="px-4 py-3 text-left text-gray-600">Select</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => {
                  const filtered = form.submissions?.filter((s) => s.year === selectedYear) ?? [];
                  const submittedQuarters = filtered.map((s) => s.quarter);

                  return (
                    <tr key={form.id} className="border-b text-gray-700">
                      <td className="px-4 py-3 flex items-center gap-2">
                        {form.file}
                        {form.description && (
                          <div className="relative group">
                            <img
                              src="https://cdn-icons-png.flaticon.com/128/11560/11560440.png"
                              alt="hint"
                              width={18}
                            />
                            <div className="absolute z-10 top-6 left-0 w-64 p-3 bg-white border border-gray-300 rounded-md shadow-md text-sm text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                submittedQuarters.includes(q)
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Submitted: {submittedQuarters.length} ครั้ง
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
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-red-500 mt-10">ไม่มีฟอร์มที่คุณเข้าถึงได้</p>
        )}
      </main>

      {showModal && selectedFormId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-96 p-6 text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-600">เลือกไตรมาสที่จะกรอก</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              {[1, 2, 3, 4].map((q) => {
                const form = forms.find((f) => f.id === selectedFormId);
                const isSubmitted =
                  Array.isArray(form?.submissions) &&
                  form.submissions.some((s) => s.year === selectedYear && s.quarter === q);

                const quarterTextMap: Record<number, string> = {
                  1: "1 ต.ค. - 31 ธ.ค.",
                  2: "1 ม.ค. - 31 มี.ค.",
                  3: "1 เม.ย. - 30 มิ.ย.",
                  4: "1 ก.ค. - 30 ก.ย.",
                };

                return (
                  <button
                    key={q}
                    onClick={() => handleSelectQuarter(q)}
                    className={`p-4 rounded-lg text-sm font-medium text-center ${
                      isSubmitted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-500 hover:text-white"
                    }`}
                  >
                    <div className="font-semibold">Quarter {q}</div>
                    <div className="text-sm">{quarterTextMap[q]}</div>
                    {isSubmitted && <div className="text-xs mt-1">เคยส่งแล้ว ✅</div>}
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
