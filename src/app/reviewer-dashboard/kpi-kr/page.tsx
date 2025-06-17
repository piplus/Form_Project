"use client";
import DashboardTemplate from "../_components/ReviewerDashboard";

export default function KpiKrDashboard() {
  return <DashboardTemplate filter={(file) => file.includes("KPI") || file.includes("KR")} />;
}