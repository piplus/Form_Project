"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Invite {
  id: number;
  email: string;
  used: boolean;
  invitedAt: string;
  role: { id: number; name: string };
}

interface Role {
  id: number;
  name: string;
}

export default function AdminInvitePage() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/invites").then(res => res.json()).then(setInvites);
    fetch("/api/admin/roles").then(res => res.json()).then(setRoles);
  }, []);

  const addInvite = async () => {
    if (!email || !roleId) return alert("Fill all fields");
    await fetch("/api/admin/invites", {
      method: "POST",
      body: JSON.stringify({ email, roleId }),
      headers: { "Content-Type": "application/json" },
    });
    setEmail(""); setRoleId(null);
    const res = await fetch("/api/admin/invites");
    const data = await res.json();
    setInvites(data);
  };

  const deleteInvite = async (id: number) => {
    await fetch("/api/admin/invites", {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    setInvites(invites.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-10 py-8 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📧 Invite Management</h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition"
          >
            🏠 Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder="email@example.com"
              className="border border-gray-300 p-2 rounded w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              value={roleId ?? ""}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="border border-gray-300 p-2 rounded w-full"
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button
              onClick={addInvite}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition w-full md:w-auto"
            >
              ➕ Add Invite
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 border-b text-gray-600">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Used</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{inv.email}</td>
                  <td className="px-4 py-2">{inv.role.name}</td>
                  <td className="px-4 py-2">{inv.used ? "✅" : "❌"}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => deleteInvite(inv.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
              {invites.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    ยังไม่มีคำเชิญ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
