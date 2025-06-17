"use client";
import DashboardTemplate from "../_components/DashboardTemplate";

export default function KpiKrDashboard() {
  return <DashboardTemplate filter={(file) => file.includes("KPI") || file.includes("KR")} />;
}
