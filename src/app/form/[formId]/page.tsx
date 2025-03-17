"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FormPage() {
  const { formId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchForm() {
      if (!formId) return;

      try {
        console.log("📌 Fetching form with ID:", formId);
        const res = await fetch(`/api/forms/${formId}`);
        const data = await res.json();

        if (data.error) {
          console.error("❌ Error fetching form:", data.error);
          setForm(null);
        } else {
          console.log("✅ Form data received:", data);
          setForm(data);
        }
      } catch (error) {
        console.error("❌ Error fetching form:", error);
        setForm(null);
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [formId]);

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      alert("กรุณาเข้าสู่ระบบก่อนส่งฟอร์ม");
      return;
    }

    console.log("📌 Submitting form...");
    console.log("📌 Form ID:", formId);
    console.log("📌 User ID:", session.user.id);
    console.log("📌 Answers:", answers);

    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, answers }),
      });

      const data = await res.json();
      console.log("📌 Server Response:", data);

      if (res.ok) {
        alert("ส่งข้อมูลฟอร์มเรียบร้อยแล้ว ✅");
        router.push("/dashboard");
      } else {
        alert("❌ เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!form) return <p className="text-center mt-10 text-red-500">Form not found</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-700">Form: {form.file}</h1>
      <form className="mt-6 w-full max-w-md bg-white p-6 shadow-md rounded-lg" onSubmit={handleSubmit}>
        {form?.questions && Array.isArray(form.questions) ? (
          form.questions.map((q: any) => (
            <div key={q.id} className="mb-4">
              <label className="block text-gray-700">{q.label}</label>
              {q.type === "text" || q.type === "number" ? (
                <input
                  type={q.type}
                  className="w-full p-3 border rounded-md bg-gray-100 text-gray-500"
                  required
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              ) : q.type === "radio" ? (
                <div className="mt-2">
                  {q.options.map((option: string) => (
                    <label key={option} className="inline-flex items-center space-x-2 mr-4">
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        className="mr-2"
                        onChange={() => handleChange(q.id, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-red-500">No questions available</p>
        )}
        <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Submit
        </button>
      </form>

      {/* ✅ ปุ่มกลับไปหน้า Dashboard */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
