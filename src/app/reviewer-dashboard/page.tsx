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

interface SubmissionResponse {
  user: string;
  email: string;
  createdAt: string;
  quarter: number;
  year: number;
  answers: string;
}

interface FormSubmissionData {
  questions: { id: string; label: string; type: string; children?: any[] }[];
  responses: SubmissionResponse[];
}

export default function ReviewerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

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
        setForms(sorted);
  
        // ✅ ดึง search ที่เคยค้นหาไว้
        const savedSearch = localStorage.getItem("reviewer-search") || "";
        setSearch(savedSearch);
  
        const filtered = sorted.filter((f) =>
          f.file.toLowerCase().includes(savedSearch.toLowerCase())
        );
        setFilteredForms(filtered);
  
        // ✅ โหลดปีที่เคยเลือกไว้โดยอิงจาก userId
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
    try {
      const res = await fetch(`/api/reviewer/forms/${formId}/export?year=${selectedYear}`, {
        method: "GET",
      });
  
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
    }
  };
  

  const handleSearch = (term: string) => {
    setSearch(term);
    localStorage.setItem("reviewer-search", term); // ✅ จำ search ไว้
    setFilteredForms(
      forms.filter((f) => f.file.toLowerCase().includes(term.toLowerCase()))
    );
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-100 text-gray-800">
      {/* Header */}
      <nav className="bg-white shadow-sm rounded-lg px-6 py-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Image src="/LOGO 2.png" alt="E-Kept Logo" width={160} height={0} />
          <h1 className="text-2xl md:text-3xl font-bold ml-10">Reviewer Dashboard</h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          🚪 Logout
        </button>
      </nav>

      {/* Search + Year */}
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

      {/* Cards */}
      {filteredForms.length === 0 ? (
        <p className="text-center text-red-500 font-medium mt-10 text-lg">
          ❌ ไม่พบข้อมูลฟอร์มที่คุณค้นหา
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-blue-700 mb-2">{form.file}</h2>
                {form.description && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{form.description}</p>
                )}
              </div>
              <button
                onClick={() => exportToExcel(form.id, form.file)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
              >
                📤 Export to Excel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>

  );
}
