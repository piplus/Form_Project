// // File: app/reviewer-dashboard/kpi-kr/page.tsx
// "use client";

// import ReviewerDashboard from "@/components/ReviewerDashboard";

// export default function KpiKrPage() {
//   return (
//     <ReviewerDashboard filter={(file) => file.includes("KPI") || file.includes("KR")} />
//   );
// }

// // File: app/reviewer-dashboard/7x/page.tsx
// "use client";

// import ReviewerDashboard from "@/components/ReviewerDashboard";

// export default function SevenXPage() {
//   return (
//     <ReviewerDashboard filter={(file) => file.toLowerCase().includes("7x")} />
//   );
// }

// // File: components/ReviewerDashboard.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useSession, signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// interface Form {
//   id: number;
//   file: string;
//   description?: string;
// }

// interface ReviewerDashboardProps {
//   filter: (file: string) => boolean;
// }

// export default function ReviewerDashboard({ filter }: ReviewerDashboardProps) {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [forms, setForms] = useState<Form[]>([]);
//   const [filteredForms, setFilteredForms] = useState<Form[]>([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const currentYear = new Date().getFullYear();
//   const [selectedYear, setSelectedYear] = useState(currentYear);

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/login");
//       return;
//     }

//     async function fetchForms() {
//       if (!session?.user?.role) return;

//       try {
//         const res = await fetch(`/api/reviewer/forms?role=${session.user.role}`);
//         if (!res.ok) throw new Error("Failed to fetch forms");

//         const data = await res.json();
//         const sorted = [...data].sort((a, b) =>
//           a.file.localeCompare(b.file, undefined, { numeric: true })
//         );

//         const savedSearch = localStorage.getItem("reviewer-search") || "";
//         setSearch(savedSearch);

//         const filtered = sorted
//           .filter((f) => f.file.toLowerCase().includes(savedSearch.toLowerCase()))
//           .filter((f) => filter(f.file));

//         setForms(sorted);
//         setFilteredForms(filtered);

//         const savedYear = localStorage.getItem(`reviewer-year-${session.user.id}`);
//         if (savedYear) {
//           setSelectedYear(Number(savedYear));
//         }
//       } catch (error) {
//         console.error("❌ Error fetching forms:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (status === "authenticated") fetchForms();
//   }, [status, session, router]);

//   const exportToExcel = async (formId: number, formFile: string) => {
//     try {
//       const res = await fetch(`/api/reviewer/forms/${formId}/export?year=${selectedYear}`);
//       if (!res.ok) throw new Error("Failed to export Excel");

//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);

//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `${formFile}_${selectedYear}.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       await fetch(`/api/reviewer/forms/${formId}/export-log?year=${selectedYear}`, {
//         method: "POST",
//       });
//     } catch (error) {
//       console.error("❌ Error exporting Excel:", error);
//     }
//   };

//   const handleSearch = (term: string) => {
//     setSearch(term);
//     localStorage.setItem("reviewer-search", term);
//     setFilteredForms(
//       forms.filter(
//         (f) =>
//           f.file.toLowerCase().includes(term.toLowerCase()) &&
//           filter(f.file)
//       )
//     );
//   };

//   if (loading) return <p className="text-center mt-10">Loading...</p>;

//   return (
//     <div className="min-h-screen p-6 md:p-10 bg-gray-100 text-gray-800">
//       <nav className="bg-white shadow-sm rounded-lg px-6 py-4 mb-8 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Image src="/LOGO 2.png" alt="E-Kept Logo" width={100} height={0} />
//           <div className="flex flex-col">
//             <h1 className="text-xl md:text-2xl font-bold text-gray-800">Reviewer Dashboard</h1>
//             <p className="text-sm text-gray-500">
//               อีเก็บ – เก็บให้ครบ ไม่หลง ไม่ลืม ไม่พลาดข้อมูลสำคัญ
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={() => signOut({ callbackUrl: "/login" })}
//           className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
//         >
//           🚪 Logout
//         </button>
//       </nav>

//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
//         <input
//           type="text"
//           placeholder="🔍 ค้นหาด้วยชื่อฟอร์ม"
//           value={search}
//           onChange={(e) => handleSearch(e.target.value)}
//           className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//         />
//         <select
//           value={selectedYear}
//           onChange={(e) => {
//             const newYear = Number(e.target.value);
//             setSelectedYear(newYear);
//             if (session?.user?.id) {
//               localStorage.setItem(`reviewer-year-${session.user.id}`, newYear.toString());
//             }
//           }}
//           className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//         >
//           {Array.from({ length: 10 }).map((_, idx) => {
//             const year = currentYear - idx;
//             return (
//               <option key={year} value={year}>
//                 ปี {year}
//               </option>
//             );
//           })}
//         </select>
//       </div>

//       {filteredForms.length === 0 ? (
//         <p className="text-center text-red-500 font-medium mt-10 text-lg">
//           ❌ ไม่พบข้อมูลฟอร์มที่คุณค้นหา
//         </p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//           {filteredForms.map((form) => {
//             const isKPI = form.file.includes("KPI");
//             const isKR = form.file.includes("KR");

//             const themeColor = isKPI ? "blue" : isKR ? "green" : "gray";

//             const bgColor = {
//               blue: "bg-blue-300",
//               green: "bg-green-300",
//               gray: "bg-purple-300",
//             }[themeColor];

//             return (
//               <div
//                 key={form.id}
//                 className="flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white min-h-[340px]"
//               >
//                 <div className="p-6 flex-1 flex flex-col justify-between">
//                   <div>
//                     <h2
//                       className="text-md font-bold text-gray-800 mb-2 break-words line-clamp-2"
//                       title={form.file}
//                     >
//                       {form.file}
//                     </h2>
//                     {form.description && (
//                       <p className="text-sm text-gray-600 whitespace-pre-line">
//                         {form.description}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="w-full h-[2px] bg-gray-200" />
//                 <div className={`${bgColor} px-6 py-4 text-right`}>
//                   <button
//                     onClick={() => exportToExcel(form.id, form.file)}
//                     className="bg-white text-sm text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
//                   >
//                     📤 Export to Excel
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
