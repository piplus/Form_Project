"use client";
import { useCallback } from "react";
import DashboardTemplate from "../_components/DashboardTemplate";

export default function SevenDashboard() {
  const filter = useCallback(
    (file: string) =>
      file.includes("7.") ||
      file.includes("แบบประเมินความพึงพอใจต่อการดำเนินงานด้านเทคโนโลยีสารสนเทศ"),
    []
  );

  return <DashboardTemplate filter={filter} />;
}