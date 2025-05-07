"use client";
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useRouter } from "next/navigation";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface RoleSummary {
  id: number;
  name: string;
  totalUsers: number;
  submitted: number;
  notSubmitted: number;
  totalSubmissions: number;
}

export default function RoleSummaryPage() {
  const [summary, setSummary] = useState<RoleSummary[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/roles/summary")
      .then((res) => res.json())
      .then(setSummary);
  }, []);

  const filteredSummary = summary.filter(
    (r) => r.name !== "admin" && !r.name.toLowerCase().startsWith("reviewer")
  );

  const labels = filteredSummary.map((s) => s.name);

  const usersChart = {
    labels,
    datasets: [
      {
        label: "Submitted",
        data: filteredSummary.map((s) => s.submitted),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
      },
      {
        label: "Not Submitted",
        data: filteredSummary.map((s) => s.notSubmitted),
        backgroundColor: "rgba(239, 68, 68, 0.7)",
      },
    ],
  };

  const submissionsChart = {
    labels,
    datasets: [
      {
        label: "Total Submissions",
        data: filteredSummary.map((s) => s.totalSubmissions),
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(0, 255, 255, 0.7)",
          "rgba(98, 255, 106, 0.7)",
          "rgba(252, 255, 50, 0.7)",
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-10 py-8 text-gray-800">
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📊 Role Summary Dashboard</h1>
        <button
          onClick={() => router.push("/admin")}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition"
        >
          🏠 Dashboard
        </button>
      </div>

      {/* 📋 Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-6xl mx-auto">
        <h2 className="text-lg font-bold px-6 py-4 border-b">📋 Role Summary Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 border-b">Role</th>
                <th className="px-4 py-3 border-b text-center">👥 Users</th>
                <th className="px-4 py-3 border-b text-center">✅ Submitted</th>
                <th className="px-4 py-3 border-b text-center">❌ Not Submitted</th>
                <th className="px-4 py-3 border-b text-center">📝 Total Submissions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummary.map((r, i) => (
                <tr
                  key={r.id}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="px-4 py-3 border-b">{r.name}</td>
                  <td className="px-4 py-3 border-b text-center">{r.totalUsers}</td>
                  <td className="px-4 py-3 border-b text-center text-green-600 font-medium">
                    {r.submitted}
                  </td>
                  <td className="px-4 py-3 border-b text-center text-red-500 font-medium">
                    {r.notSubmitted}
                  </td>
                  <td className="px-4 py-3 border-b text-center">{r.totalSubmissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📊 Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">👤 User Submission Status</h2>
          <div className="relative h-[400px] w-full">
            <Bar
              data={usersChart}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">📝 Total Form Submissions</h2>
          <div className="relative h-[400px] w-full">
            <Pie
              data={submissionsChart}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
