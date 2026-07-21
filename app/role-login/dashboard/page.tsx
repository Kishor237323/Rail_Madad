import { RailwayStaffDashboard } from "@/components/role-login/railway-staff-dashboard";

export default async function RoleDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ staff?: string }>;
}) {
  const params = await searchParams;
  return <RailwayStaffDashboard staffUsername={params.staff ?? ""} />;
}
