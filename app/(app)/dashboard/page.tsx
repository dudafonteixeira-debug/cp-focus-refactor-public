"use client";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  return <DashboardView {...useDashboard()} />;
}
