"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const role = session?.user?.role;

      if (role === "admin") {
        router.push("/admin");
      } else if (role?.startsWith("reviewer")) {
        router.push("/reviewer-dashboard/kpi-kr");
      } else {
        router.push("/dashboard/kpi-kr");
      }
    }
  }, [status, session, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>กำลังโหลด...</p>
    </main>
  );
}