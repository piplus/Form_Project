"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("❗ คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) return;
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900">👥 User Management</h1>
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition"
        >
          🏠 Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="mb-4 text-gray-600 font-medium">
          รวมทั้งหมด: {users.length} users
        </div>

        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 border-b">ID</th>
                <th className="px-4 py-3 border-b">Name</th>
                <th className="px-4 py-3 border-b">Email</th>
                <th className="px-4 py-3 border-b">Role</th>
                <th className="px-4 py-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="px-4 py-2 border-b text-center">{user.id}</td>
                  <td className="px-4 py-2 border-b">{user.name}</td>
                  <td className="px-4 py-2 border-b">{user.email}</td>
                  <td className="px-4 py-2 border-b">{user.role?.name || "-"}</td>
                  <td className="px-4 py-2 border-b text-center">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
