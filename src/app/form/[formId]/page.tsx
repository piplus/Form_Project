"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FormPage() {
  const { formId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  const searchParams = useSearchParams();
  const quarter = Number(searchParams.get("quarter"));
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const from = searchParams.get("from");
  const safeBackPath = from?.startsWith("/dashboard/") ? from : "/dashboard";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
  const [showConsentPopup, setShowConsentPopup] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
  async function fetchForm() {
      if (!formId) return;
      try {
        const res = await fetch(`/api/forms/${formId}`);
        const data = await res.json();
        if (!data.error) {
          setForm(data);

          // ตรวจสอบชื่อฟอร์ม
          if (data.file?.includes("แบบสอบถาม") || data.file?.includes("แบบประเมิน") ) {
            setShowConsentPopup(true); // แสดง popup ยืนยันการใช้ข้อมูล
          } else {
            setConsentGiven(true); // ผ่านได้เลย
          }
        } else {
          setForm(null);
        }
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

    if (isSubmitting) return; // ❌ ป้องกันกดซ้ำระหว่างส่ง
    if (!session?.user?.id) {
      alert("กรุณาเข้าสู่ระบบก่อนส่งฟอร์ม");
      return;
    }

    setIsSubmitting(true); // ✅ เริ่มโหลด

    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, answers, quarter, year }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("ส่งข้อมูลฟอร์มเรียบร้อยแล้ว ✅");
        router.push(safeBackPath);
      } else {
        alert("❌ เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("เกิดข้อผิดพลาดขณะส่งฟอร์ม");
    } finally {
      setIsSubmitting(false); // ✅ หยุดโหลด
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
        setImagePreviews((prev) => ({ ...prev, [questionId]: base64 }));
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (loading) return <p className="text-center mt-10 text-lg">Loading...</p>;
  if (!form) return <p className="text-center mt-10 text-red-500 text-lg">Form not found</p>;

  if (showConsentPopup && !consentGiven) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 leading-snug text-center">
            ขอความยินยอมในการใช้ข้อมูลสำหรับการประเมิน<br />
            <span className="text-base font-normal text-gray-600">
              (ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)
            </span>
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed text-md">
            <p>
              ระบบ <strong>E-GEB</strong> เป็นแพลตฟอร์มสำหรับการบริหารจัดการข้อมูลอย่างมีหลักฐานและเป็นระบบ
              พัฒนาโดย ฝ่ายบริหารและวางแผน คณะวิศวกรรมศาสตร์ (2025)
              เพื่อสนับสนุนการบริหารจัดการข้อมูลที่สำคัญให้เป็นไปอย่างมีประสิทธิภาพ
              ทั้งในด้านการบริหารจัดการทั่วไปและการดำเนินงานด้านประกันคุณภาพการศึกษา (EdPEx)
            </p>
            <p>
              ผู้ใช้งานทุกท่านจำเป็นต้องเข้าสู่ระบบเพื่อยืนยันตัวตนในการเข้าถึงระบบ
              แต่ข้อมูลที่ท่านกรอกในส่วนของการประเมินจะถูกจัดเก็บเป็นความลับ
              และจะไม่ถูกเชื่อมโยงกับตัวตนของผู้ใช้งานแต่ละราย
            </p>
            <p>
              ข้อมูลจากแบบประเมินจะถูกใช้เพื่อการวิเคราะห์ ปรับปรุงการดำเนินงาน
              และการประเมินผลในภาพรวมของหน่วยงาน
              โดยไม่มีการเปิดเผยข้อมูลส่วนบุคคลหรือเชื่อมโยงผลการประเมินกลับไปยังบุคคลใดบุคคลหนึ่ง
            </p>
            <p>
              ระบบ E-GEB มีมาตรการด้านความปลอดภัยในการจัดเก็บและปกป้องข้อมูล
              ตามที่กฎหมาย PDPA กำหนด
              เพื่อให้ท่านมั่นใจได้ว่าข้อมูลของท่านจะถูกใช้เฉพาะตามวัตถุประสงค์ที่แจ้งไว้เท่านั้น
            </p>
          </div>

          <div className="flex items-start space-x-3 pt-4">
            <input
              type="checkbox"
              id="consentCheckbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="consentCheckbox" className="text-gray-700 text-md">
              ข้าพเจ้ายินยอมให้ระบบ E-GEB ใช้ข้อมูลจากแบบประเมินตามวัตถุประสงค์ที่ระบุไว้ โดยไม่มีการเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              onClick={() => router.push(safeBackPath)}
              className="inline-flex items-center justify-center px-5 py-2.5 text-md font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-black transition"
            >
              ยกเลิก
            </button>
            
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 py-10">
      <div className="w-full max-w-3xl flex justify-between items-center mb-4">
        <h1
          className="text-2xl md:text-4xl font-bold text-gray-800 break-words max-w-[60%] truncate"
          title={form.file}
        >
          📋 Form: {form.file}
        </h1>
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
                  <legend className="text-lg font-semibold text-gray-700 whitespace-pre-wrap">{q.label}<hr></hr></legend>
                  {q.children?.map((qChild: any) => (
                    <div key={qChild.id} className="mt-4">
                      <label className="whitespace-pre-line block text-md font-medium text-gray-600 mb-1 ">
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
                  <label className="block text-lg font-medium text-gray-700 whitespace-pre-wrap">{q.label}</label>
                  
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
                      className="w-full p-2 border rounded text-gray-600"
                    />
                  ) : q.type === "date-range" ? (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">วันที่เริ่มต้น</label>
                        <input
                          type="date"
                          required
                          className="w-full p-3 border border-gray-300 rounded-md text-gray-600"
                          onChange={(e) => handleChange(`${q.id}_start`, e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">วันที่สิ้นสุด</label>
                        <input
                          type="date"
                          required
                          min={typeof answers[`${q.id}_start`] === "string" ? answers[`${q.id}_start`] as string : today}
                          className="w-full p-3 border border-gray-300 rounded-md text-gray-600"
                          onChange={(e) => handleChange(`${q.id}_end`, e.target.value)}
                        />
                      </div>
                    </div>
                  ) : q.type === "link" ? (
                    <a
                      href={q.value || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {q.value}
                    </a>
                  ) : q.type === "label" ? (
                      <p className="text-md text-gray-700 whitespace-pre-wrap">
                        {q.value}
                      </p> 
                  ) : null }
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
          disabled={isSubmitting}
          className={`w-full text-white text-lg py-3 rounded-md transition shadow-md ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "กำลังส่งข้อมูล..." : "Submit Form"}
        </button>
      </form>

      <button
        onClick={() => router.push(safeBackPath)}
        className="mt-6 px-6 py-3 text-lg bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
      >
        ⬅ Back to Dashboard
      </button>
    </div>
  );
}
