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
    <div className="min-h-screen p-10 bg-gray-100">
      {/* Header */}
      <nav className="bg-gray-200 shadow px-6 py-3 flex justify-between items-center rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <Image src="/weblogo2.png" alt="E-Kept Logo" width={200} height={0} />
          <h1 className="text-3xl font-bold text-gray-700">Reviewer Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Search */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="🔍 ค้นหาด้วยชื่อฟอร์ม"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 text-gray-600"
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
          className="w-full md:w-auto px-3 py-2 rounded-md border border-gray-300 shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-400"
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

      {/* Card Grid */}
      {filteredForms.length === 0 ? (
        <p className="text-red-500 font-semibold text-center text-lg mt-6">
          ❌ ไม่พบข้อมูลฟอร์มที่คุณค้นหา
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-600">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2 text-blue-800">{form.file}</h2>
              {form.description && (
                <p className="text-sm text-gray-500 mb-4 leading-snug">{form.description}</p>
              )}
              <button
                onClick={() => exportToExcel(form.id, form.file)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Export to Excel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
