"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRolesPage() {
    const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editName, setEditName] = useState("");

  const fetchRoles = async () => {
    const res = await fetch("/api/admin/roles-page");
    const data = await res.json();
    setRoles(data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/roles-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    fetchRoles();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/admin/roles-page", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchRoles();
  };

  const openEditDialog = (id: number, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
    setShowDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await fetch("/api/admin/roles-page", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, name: editName }),
    });
    setShowDialog(false);
    setEditingId(null);
    setEditName("");
    fetchRoles();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 text-gray-800">
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">🎛️ Role Management</h1>
        <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition"
        >
            <span className="text-sm">🏠 Dashboard</span>
        </button>
        </div>

      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3 mb-8 max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Enter new role name"
          className="border border-gray-300 rounded-lg px-4 py-2 flex-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Add
        </button>
      </form>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white max-w-4xl mx-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 border-b">ID</th>
              <th className="px-5 py-3 border-b">Role Name</th>
              <th className="px-5 py-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, index) => (
              <tr
                key={role.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-indigo-50 transition`}
              >
                <td className="px-5 py-3 border-b">{role.id}</td>
                <td className="px-5 py-3 border-b">{role.name}</td>
                <td className="px-5 py-3 border-b text-center space-x-2">
                  <button
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                    onClick={() => openEditDialog(role.id, role.name)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 font-medium"
                    onClick={() => handleDelete(role.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[320px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Role Name</h2>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
