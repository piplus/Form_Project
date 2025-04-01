"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [formAccess, setFormAccess] = useState<any[]>([]);
  const [selectedForms, setSelectedForms] = useState<{ [roleId: number]: number[] }>({});
  // const [selectedForms, setSelectedForms] = useState<{ [roleId: number]: number[] }>({});
  const [hoverTimeouts, setHoverTimeouts] = useState<{ [key: number]: NodeJS.Timeout | null }>({});
  const [dropdownOpen, setDropdownOpen] = useState<{ [roleId: number]: boolean }>({});
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

  const assignSelectedForms = async (roleId: number) => {
    const formIds = selectedForms[roleId] || [];
    if (formIds.length === 0) return alert("กรุณาเลือกอย่างน้อยหนึ่งฟอร์ม");

    for (const formId of formIds) {
      await fetch("/api/admin/form-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, formId }),
      });
    }

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
      <nav className="bg-gray-200 shadow px-6 py-3 flex justify-between items-center rounded-lg">
        <div className="flex items-center gap-2">
          <Image src="/weblogo2.png" alt="E-Kept Logo" width={200} height={0} />
          <h1 className="text-3xl font-bold text-gray-700">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/export-log")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export Log
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-3 text-left text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-gray-700">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="px-4 py-3 text-gray-500">{user.name}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3 text-gray-500">
                  <select
                    value={user.role.id}
                    onChange={(e) => updateRole(user.id, Number(e.target.value))}
                    className="border p-2 rounded-md"
                  >
                    {roles.map((role) => (
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

      {/* Form Access Management */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
        <h2 className="text-xl font-bold p-4 text-gray-700">Form Access Management</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-3 text-left text-gray-700">Role</th>
              <th className="px-4 py-3 text-left text-gray-700 w-400">Forms</th>
              <th className="px-4 py-3 text-left text-gray-700">Assign Form</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const availableForms = forms.filter(
                (form) => !formAccess.some((fa) => fa.role.id === role.id && fa.form.id === form.id)
              );

              return (
                <tr key={role.id} className="border-b">
                  <td className="px-4 py-3 text-gray-500">{role.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <div className="flex flex-wrap gap-2">
                      {formAccess
                        .filter((fa) => fa.role.id === role.id)
                        .sort((a, b) => a.form.file.localeCompare(b.form.file, undefined, { numeric: true }))
                        .map((fa) => (
                          <span
                            key={fa.form.id}
                            className="bg-blue-200 rounded-full px-3 py-1 inline-flex items-center text-sm"
                          >
                            {fa.form.file}
                            <button
                              onClick={() => revokeAccess(role.id, fa.form.id)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ✖
                            </button>
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 relative">
                    <div
                      className="relative"
                      onMouseEnter={() => {
                        if (hoverTimeouts[role.id]) clearTimeout(hoverTimeouts[role.id]!);
                        setDropdownOpen((prev) => ({ ...prev, [role.id]: true }));
                      }}
                      onMouseLeave={() => {
                        const timeout = setTimeout(() => {
                          setDropdownOpen((prev) => ({ ...prev, [role.id]: false }));
                        }, 150); // 150ms delay
                        setHoverTimeouts((prev) => ({ ...prev, [role.id]: timeout }));
                      }}
                    >
                      <button
                        onClick={() =>
                          setDropdownOpen((prev) => ({
                            ...prev,
                            [role.id]: !prev[role.id],
                          }))
                        }
                        className="w-70 border p-2 rounded-md bg-white text-left"
                      >
                        {selectedForms[role.id]?.length > 0
                          ? `เลือกแล้ว ${selectedForms[role.id].length} ฟอร์ม`
                          : "เลือกฟอร์ม"}
                      </button>

                      {dropdownOpen[role.id] && (
                        <div className="absolute z-10 mt-2 bg-white border rounded shadow p-4 w-70 max-h-60 overflow-auto">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-600">เลือกฟอร์ม</span>
                            <button
                              className="text-red-500 hover:text-red-700 text-sm"
                              onClick={() =>
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  [role.id]: false,
                                }))
                              }
                            >
                              ❌
                            </button>
                          </div>

                          {availableForms.map((form) => {
                            const selected = selectedForms[role.id]?.includes(form.id) ?? false;
                            return (
                              <label
                                key={form.id}
                                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 text-gray-600"
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => {
                                    setSelectedForms((prev) => {
                                      const current = prev[role.id] || [];
                                      return {
                                        ...prev,
                                        [role.id]: selected
                                          ? current.filter((id) => id !== form.id)
                                          : [...current, form.id],
                                      };
                                    });
                                  }}
                                />
                                <span>{form.file}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => assignSelectedForms(role.id)}
                      className="mt-2 w-70 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      + Assign Selected
                    </button>
                  </td>




                    


                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
