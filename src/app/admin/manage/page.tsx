
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Form {
  id: number;
  file: string;
  description: string;
}

export default function AdminFormsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [forms, setForms] = useState<Form[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editFile, setEditFile] = useState("");

  useEffect(() => {
    fetch("/api/admin/forms").then(res => res.json()).then(setForms);
  }, []);

  const handleEdit = async () => {
    await fetch(`/api/admin/forms/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: editFile }),
    });
    setEditId(null);
    location.reload();
  };

  const handleDelete = async (id: number) => {
    if (confirm("ยืนยันการลบฟอร์ม?")) {
      await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
      setForms((prev) => prev.filter((f) => f.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-10 py-8 text-gray-800">
        <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">🧾 จัดการฟอร์มทั้งหมด</h1>
            <button
                onClick={() => router.push("/admin")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition"
                >
                🏠 Dashboard
            </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 border-b text-gray-600">
                <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">ชื่อฟอร์ม</th>
                <th className="px-4 py-2 text-right">Action</th>
                </tr>
            </thead>
            <tbody>
                {forms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{form.id}</td>
                    <td className="px-4 py-2">{form.file}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                    <button
                        onClick={() => {
                        setEditId(form.id);
                        setEditFile(form.file);
                        }}
                        className="text-blue-600 hover:underline"
                    >
                        แก้ชื่อ
                    </button>
                    <button
                        onClick={() => handleDelete(form.id)}
                        className="text-red-600 hover:underline"
                    >
                        ลบ
                    </button>
                    </td>
                </tr>
                ))}
                {forms.length === 0 && (
                <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                    ยังไม่มีฟอร์ม
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>

        {editId && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white text-black p-6 rounded-lg shadow-lg w-96 space-y-4">
                <h2 className="text-xl font-semibold">แก้ชื่อฟอร์ม</h2>
                <input
                value={editFile}
                onChange={(e) => setEditFile(e.target.value)}
                className="border p-2 w-full rounded"
                />
                <div className="flex justify-end gap-2">
                <button onClick={() => setEditId(null)} className="text-gray-500 hover:underline">
                    ยกเลิก
                </button>
                <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded">
                    บันทึก
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    </div>
    );

}
