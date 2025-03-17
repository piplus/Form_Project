"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [formAccess, setFormAccess] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const resUsers = await fetch("/api/admin/users");
        const resForms = await fetch("/api/admin/forms");
        const resRoles = await fetch("/api/admin/roles");
        const resFormAccess = await fetch("/api/admin/form-access");

        const usersData = await resUsers.json();
        const formsData = await resForms.json();
        const rolesData = await resRoles.json();
        const formAccessData = await resFormAccess.json();

        setUsers(usersData);
        setForms(formsData);
        setRoles(rolesData);
        setFormAccess(formAccessData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const updateRole = async (userId: number, roleId: number) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roleId }),
    });
    window.location.reload();
  };

  const grantAccess = async (roleId: number, formId: number) => {
    if (!formId) {
      alert("กรุณาเลือกฟอร์มก่อนเพิ่มสิทธิ์");
      return;
    }

    await fetch("/api/admin/form-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, formId }),
    });
    window.location.reload();
  };

  const revokeAccess = async (roleId: number, formId: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสิทธิ์นี้?")) return;

    await fetch("/api/admin/form-access", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, formId }),
    });
    window.location.reload();
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-700">Admin Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* ตาราง Users */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-3 text-left text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-gray-700">Role</th>
              <th className="px-4 py-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) &&
              users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="px-4 py-3 text-gray-500">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <select
                      value={user.role.id}
                      onChange={(e) => updateRole(user.id, Number(e.target.value))}
                      className="border p-2 rounded-md"
                    >
                      {Array.isArray(roles) &&
                        roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ตาราง FormAccess */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
        <h2 className="text-xl font-bold p-4 text-gray-700">Form Access Management</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-3 text-left text-gray-700">Role</th>
              <th className="px-4 py-3 text-left text-gray-700">Forms</th>
              <th className="px-4 py-3 text-left text-gray-700">Assign Form</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(roles) &&
              roles.map((role) => (
                <tr key={role.id} className="border-b">
                  <td className="px-4 py-3 text-gray-500">{role.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {Array.isArray(formAccess) &&
                      formAccess
                        .filter((fa) => fa.role.id === role.id)
                        .map((fa) => (
                          <span key={fa.form.id} className="mr-2 p-1 bg-blue-200 rounded inline-flex items-center">
                            {fa.form.file}
                            <button
                              onClick={() => revokeAccess(role.id, fa.form.id)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ✖
                            </button>
                          </span>
                        ))}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      onChange={(e) => grantAccess(role.id, Number(e.target.value))}
                      className="border p-2 rounded-md text-gray-500"
                    >
                      <option value="">เลือก Form</option>
                      {Array.isArray(forms) && forms.length > 0 ? (
                        forms.map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.file}
                          </option>
                        ))
                      ) : (
                        <option disabled>ไม่มีฟอร์มให้เลือก</option>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
