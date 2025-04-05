"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FormPage() {
  const { formId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});

  const searchParams = useSearchParams();
  const quarter = Number(searchParams.get("quarter"));
  const year = Number(searchParams.get("year")) || new Date().getFullYear(); // fallback year

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    async function fetchForm() {
      if (!formId) return;
      try {
        const res = await fetch(`/api/forms/${formId}`);
        const data = await res.json();
        setForm(data.error ? null : data);
      } catch (err) {
        console.error("❌ Error fetching form:", err);
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
        body: JSON.stringify({ userId: session.user.id, answers, quarter, year }),
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

  const handleFileUpload = (questionId: string, file: File) => {
    return new Promise<void>((resolve, reject) => {
      if (file.size > 1024 * 1024) {
        alert("ไฟล์ภาพต้องไม่เกิน 1MB");
        return reject("File too large");
      }
  
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAnswers((prev) => ({ ...prev, [questionId]: base64 }));
        setImagePreviews((prev) => ({ ...prev, [questionId]: base64 })); // ✅ เก็บสำหรับ preview
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (loading) return <p className="text-center mt-10 text-lg">Loading...</p>;
  if (!form) return <p className="text-center mt-10 text-red-500 text-lg">Form not found</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 py-10">
      <div className="w-full max-w-3xl flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-gray-800">📋 Form: {form.file}</h1>
        <div className="text-right text-gray-600 text-lg">
          <div>Quarter: <span className="font-semibold">Q{quarter}</span></div>
          <div>Year: <span className="font-semibold">{year}</span></div>
        </div>
      </div>

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
                                required
                                name={qChild.id} // ✅ ใช้ id ที่ถูกต้องของฟิลด์ย่อย
                                value={option}
                                className="mr-2"
                                onChange={() => handleChange(qChild.id, option)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : q.type === "text" ? (
                        <input
                          type={qChild.type || "text"}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 text-md"
                          onChange={(e) => handleChange(qChild.id, e.target.value)}
                        />
                      ) : qChild.type === "checkbox" ? (
                        // <label className="flex items-center gap-2 text-md text-gray-700">
                          <input
                            type="checkbox"
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            onChange={(e) => handleChange(qChild.id, e.target.checked ? e.target.value : "")}
                            value="checked"
                          />
                          // {qChild.label}
                        // </label>
                      ) : 
                      qChild.type === "file" ? (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              await handleFileUpload(qChild.id, e.target.files[0]); // ✅ ใช้ id ที่ตรงกับคำถาม
                            }
                          }}
                          className="w-full p-2 border rounded text-gray-600"
                        />
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
                    <div className="flex flex-wrap gap-6 mt-2 text-gray-700">
                      {q.options.map((option: string) => (
                        <div key={option} className="flex items-center gap-2">
                          <input
                            type="radio"
                            required
                            name={q.id}
                            value={option}
                            onChange={(e) => {
                              handleChange(q.id, e.target.value);
                              if (option === "อื่น ๆ (Etc.)") {
                                handleChange(`${q.id}_etc`, ""); // prepare empty value
                              }
                            }}
                            checked={answers[q.id] === option}
                          />
                          <label>{option}</label>
                  
                          {/* ถ้าเลือก "อื่น ๆ (Etc.)" ให้แสดง Textbox */}
                          {answers[q.id] === "อื่น ๆ (Etc.)" && option === "อื่น ๆ (Etc.)" && (
                            <input
                              type="text"
                              placeholder="กรุณาระบุ"
                              className="ml-2 p-2 border rounded"
                              onChange={(e) => handleChange(`${q.id}_etc`, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : q.type === "checkbox" ? (
                    <div className="flex flex-wrap gap-6 mt-2">
                      {q.options.map((option: string) => {
                        const selected = (answers[q.id] as string[])?.includes(option) ?? false;
                  
                        return (
                          <label key={option} className="inline-flex items-center text-lg text-gray-600">
                            <input
                              type="checkbox"
                              value={option}
                              checked={selected}
                              onChange={() =>
                                setAnswers((prev) => {
                                  const current = (prev[q.id] as string[]) ?? [];
                                  const updated = selected
                                    ? current.filter((val) => val !== option)
                                    : [...current, option];
                                  return { ...prev, [q.id]: updated };
                                })
                              }
                              className="mr-2"
                            />
                            {option}
                          </label>
                        );
                      })}
                    </div>
                  ) : q.type === "file" ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          await handleFileUpload(q.id, e.target.files[0]);
                        }
                      }}
                      className="w-full p-2 border rounded"
                    />
                  ) : null}
                  
                  
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-red-500 text-lg">No questions available</p>
        )}

        <p className="text-red-500 text-lg">หากไม่มีข้อมูล กรุณาใส่เครื่องหมาย -</p>  
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
