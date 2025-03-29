"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ExportLog {
  id: number;
  exportedAt: string;
  user: { name: string; email: string };
  form: { file: string };
}

export default function ExportLogPage() {
  const [logs, setLogs] = useState<ExportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchLogs() {
      const res = await fetch("/api/admin/export-log");
      const data = await res.json();
      setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📝 Export Log</h1>
        <button
          onClick={() => router.push("/admin")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-gray-700">Form</th>
              <th className="px-4 py-3 text-left text-gray-700">Exported By</th>
              <th className="px-4 py-3 text-left text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b text-gray-600">
                <td className="px-4 py-3">{log.form.file}</td>
                <td className="px-4 py-3">{log.user.name}</td>
                <td className="px-4 py-3">{log.user.email}</td>
                <td className="px-4 py-3">
                  {new Date(log.exportedAt).toLocaleString("th-TH", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
