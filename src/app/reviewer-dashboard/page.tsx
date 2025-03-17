"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface Form {
  id: number;
  file: string;
}

interface SubmissionResponse {
  user: string;
  email: string;
  createdAt: string;
  answers: string; // JSON string that needs to be parsed
}

interface FormSubmissionData {
  questions: { id: string; label: string; type: string }[];
  responses: SubmissionResponse[];
}

export default function ReviewerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

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
        setForms(data);
      } catch (error) {
        console.error("❌ Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchForms();
    }
  }, [status, session, router]);

  const exportToExcel = async (formId: number, formFile: string) => {
    try {
      const res = await fetch(`/api/reviewer/forms/${formId}/submissions`);
      if (!res.ok) throw new Error("Failed to fetch submissions");

      const data: FormSubmissionData = await res.json();
      const { questions, responses } = data;

      if (!questions || questions.length === 0) {
        console.error("❌ No questions found");
        return;
      }

      if (!responses || responses.length === 0) {
        console.error("❌ No responses found");
        return;
      }

      // ✅ แปลง JSON เป็น Sheet คำตอบโดยใช้ Label เป็น Key
      const formattedResponses = responses.map((response) => {
        // ✅ ตรวจสอบว่า `answers` เป็น JSON string หรือ object
        const parsedAnswers =
          typeof response.answers === "string"
            ? JSON.parse(response.answers || "{}") // ถ้าเป็น string → parse
            : response.answers || {}; // ถ้าเป็น object → ใช้ได้เลย

        // ✅ สร้างอ็อบเจ็กต์ใหม่ให้ Mapping Label ของ Questions
        const mappedAnswers: { [key: string]: string } = {};
        questions.forEach((q) => {
          mappedAnswers[q.label] = parsedAnswers[q.id] || ""; // ใช้ `id` ของคำถามจับคู่กับคำตอบ
        });

        return {
          "User Name": response.user,
          "User Email": response.email,
          "Submitted At": new Date(response.createdAt).toLocaleString(),
          ...mappedAnswers, // ✅ นำคำตอบที่ Map แล้วใส่เข้าไป
        };
      });

      const responsesSheet = XLSX.utils.json_to_sheet(formattedResponses);

      // ✅ สร้าง Workbook และบันทึกไฟล์
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, responsesSheet, "Responses");
      XLSX.writeFile(wb, `${formFile}.xlsx`);

      console.log("✅ Exported successfully:", `${formFile}.xlsx`);
    } catch (error) {
      console.error("❌ Error exporting Excel:", error);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      {/* ✅ Header + Logout Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center text-gray-900">Reviewer Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* ✅ Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-500">
        {forms.map((form) => (
          <div key={form.id} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{form.file}</h2>
            <button
              onClick={() => exportToExcel(form.id, form.file)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Export to Excel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
