"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Form {
  id: number;
  file: string;
  description?: string;
}

interface ReviewerDashboardProps {
  filter: (file: string) => boolean;
}

export default function ReviewerDashboard({ filter }: ReviewerDashboardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [modalForm, setModalForm] = useState<Form | null>(null);
  const [exportingFormId, setExportingFormId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    async function fetchForms() {
      if (!session?.user?.role) return;

      try {
        const res = await fetch(`/api/reviewer/forms?role=${session.user.role}`);
        if (!res.ok) throw new Error("Failed to fetch forms");

        const data = await res.json();
        const sorted = [...data].sort((a, b) =>
          a.file.localeCompare(b.file, undefined, { numeric: true })
        );

        const savedSearch = localStorage.getItem("reviewer-search") || "";
        setSearch(savedSearch);

        const filtered = sorted
          .filter((f) => f.file.toLowerCase().includes(savedSearch.toLowerCase()))
          .filter((f) => filter(f.file));

        setForms(sorted);
        setFilteredForms(filtered);

        const savedYear = localStorage.getItem(`reviewer-year-${session.user.id}`);
        if (savedYear) {
          setSelectedYear(Number(savedYear));
        }
      } catch (error) {
        console.error("❌ Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") fetchForms();
  }, [status, session, router]);

  const exportToExcel = async (formId: number, formFile: string) => {
    if (exportingFormId !== null) return; // ❌ ถ้ากำลัง export อันใดอันหนึ่งอยู่

    setExportingFormId(formId); // ✅ จำว่าอันไหนกำลัง export
    try {
      const res = await fetch(`/api/reviewer/forms/${formId}/export?year=${selectedYear}`);
      if (!res.ok) throw new Error("Failed to export Excel");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${formFile}_${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      await fetch(`/api/reviewer/forms/${formId}/export-log?year=${selectedYear}`, {
        method: "POST",
      });
    } catch (error) {
      console.error("❌ Error exporting Excel:", error);
      alert("เกิดข้อผิดพลาดระหว่าง Export");
    } finally {
      setExportingFormId(null); // ✅ เคลียร์สถานะ
    }
  };


  const handleSearch = (term: string) => {
    setSearch(term);
    localStorage.setItem("reviewer-search", term);
    setFilteredForms(
      forms.filter(
        (f) =>
          f.file.toLowerCase().includes(term.toLowerCase()) &&
          filter(f.file)
      )
    );
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-100 text-gray-800">
      <nav className="bg-white shadow-sm rounded-lg px-6 py-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src="/LOGO 2.png" alt="E-Kept Logo" width={100} height={0} />
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Reviewer Dashboard</h1>
            <p className="text-sm text-gray-500">
              อีเก็บ – เก็บให้ครบ ไม่หลง ไม่ลืม ไม่พลาดข้อมูลสำคัญ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
            <span className="text-sm text-gray-700 hidden sm:block">
                👋 {session?.user?.name} ({session?.user?.role})
            </span>

            <button
                onClick={() => router.push("/reviewer-dashboard/kpi-kr")}
                className="px-4 py-2 rounded-xl bg-green-300 text-white text-sm font-medium shadow-md hover:bg-green-600 hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
            >
                KR-KPI Form
            </button>

            <button
                onClick={() => router.push("/reviewer-dashboard/7x")}
                className="px-4 py-2 rounded-xl bg-purple-300 text-white text-sm font-medium shadow-md hover:bg-purple-600 hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
            >
                EdPex Form
            </button>

            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-4 py-2 rounded-xl bg-red-300 text-white text-sm font-medium shadow-md hover:bg-red-600 hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
            >
                Logout
            </button>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <input
          type="text"
          placeholder="🔍 ค้นหาด้วยชื่อฟอร์ม"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={selectedYear}
          onChange={(e) => {
            const newYear = Number(e.target.value);
            setSelectedYear(newYear);
            if (session?.user?.id) {
              localStorage.setItem(`reviewer-year-${session.user.id}`, newYear.toString());
            }
          }}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        >
          {Array.from({ length: 10 }).map((_, idx) => {
            const year = currentYear - idx;
            return (
              <option key={year} value={year}>
                ปี {year}
              </option>
            );
          })}
        </select>
      </div>

      {filteredForms.length === 0 ? (
        <p className="text-center text-red-500 font-medium mt-10 text-lg">
          ❌ ไม่พบข้อมูลฟอร์มที่คุณค้นหา
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredForms.map((form) => {
            const isKPI = form.file.includes("KPI");
            const isKR = form.file.includes("KR");

            const themeColor = isKPI ? "blue" : isKR ? "green" : "gray";

            const bgColor = {
              blue: "bg-blue-300",
              green: "bg-green-300",
              gray: "bg-purple-300",
            }[themeColor];

            return (
              <div
                key={form.id}
                className="flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white h-[380px]"
              >
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2
                      className="text-md font-bold text-gray-800 mb-2 break-words line-clamp-2 "
                      title={form.file}
                    >
                      {form.file}
                    </h2>
                    {form.description && (
                      <>
                        <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">
                          {form.description}
                        </p>
                        <button
                          onClick={() => setModalForm(form)}
                          className="mt-10 px-4 py-2 rounded-xl text-black text-sm font-medium shadow-md hover:bg-blue-600 hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
                        >
                          อ่านเพิ่มเติม
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-full h-[2px] bg-gray-200" />
                <div className={`${bgColor} px-6 py-4 text-right`}>
                  <button
                    onClick={() => exportToExcel(form.id, form.file)}
                    disabled={exportingFormId === form.id}
                    className={`bg-white text-sm px-4 py-2 rounded-md transition ${
                      exportingFormId === form.id
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {exportingFormId === form.id ? "📤 กำลัง Export..." : "📤 Export to Excel"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {modalForm.file}
            </h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 max-h-[60vh] overflow-auto">
              {modalForm.description}
            </pre>
            <div className="text-right mt-6">
              <button
                onClick={() => setModalForm(null)}
                className="text-sm text-gray-500 hover:underline"
              >
                ❌ ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
