import { RailwayStaffDashboard } from "@/components/role-login/railway-staff-dashboard";

export default function RoleDashboardPage({
  searchParams,
}: {
  searchParams?: { staff?: string | string[] };
}) {
  const staff = typeof searchParams?.staff === "string" ? searchParams.staff : Array.isArray(searchParams?.staff) ? searchParams.staff[0] ?? "" : "";

  return <RailwayStaffDashboard staffUsername={staff} />;
}
