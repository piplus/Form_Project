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
        const res = await fetch(`/api/forms/${formId}`);
        const data = await res.json();
        setForm(data.error ? null : data);
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

    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, answers }),
      });

      const data = await res.json();
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

  if (loading) return <p className="text-center mt-10 text-lg">Loading...</p>;
  if (!form) return <p className="text-center mt-10 text-red-500 text-lg">Form not found</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">📋 Form: {form.file}</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg space-y-6"
      >
        {form?.questions?.length > 0 ? (
          form.questions.map((q: any) => (
            <div key={q.id} className="space-y-2">
              {q.type === "group" ? (
                <fieldset className="border border-gray-300 p-4 rounded-md">
                  <legend className="text-lg font-semibold text-gray-700">{q.label}</legend>
                  {q.children?.map((qChild: any) => (
                    <div key={qChild.id} className="mt-4">
                      <label className="block text-md font-medium text-gray-600 mb-1">
                        {qChild.label}
                      </label>

                      {qChild.type === "radio" ? (
                        <div className="flex flex-wrap gap-6 mt-2">
                          {qChild.options.map((option: string) => (
                            <label
                              key={option}
                              className="inline-flex items-center text-md text-gray-600"
                            >
                              <input
                                type="radio"
                                name={qChild.id} // ✅ ใช้ id ที่ถูกต้องของฟิลด์ย่อย
                                value={option}
                                className="mr-2"
                                onChange={() => handleChange(qChild.id, option)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={qChild.type || "text"}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 text-md"
                          onChange={(e) => handleChange(qChild.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </fieldset>
              ) : (
                <>
                  <label className="block text-lg font-medium text-gray-700">{q.label}</label>
                  {q.type === "text" || q.type === "number" || q.type === "date" ? (
                  <input
                    type={q.type}
                    required
                    className="w-full p-4 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 text-lg"
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                  ) : q.type === "radio" ? (
                    <div className="flex flex-wrap gap-6 mt-2">
                      {q.options.map((option: string) => (
                        <label key={option} className="inline-flex items-center text-lg text-gray-600">
                          <input
                            type="radio"
                            name={q.id}
                            value={option}
                            className="mr-2"
                            onChange={() => handleChange(q.id, option)}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-red-500 text-lg">No questions available</p>
        )}


        <button
          type="submit"
          className="w-full bg-blue-600 text-white text-lg py-3 rounded-md hover:bg-blue-700 transition shadow-md"
        >
          Submit Form
        </button>
      </form>

      <button
        onClick={() => router.push("/dashboard")}
        className="mt-6 px-6 py-3 text-lg bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
      >
        ⬅ Back to Dashboard
      </button>
    </div>
  );
}
