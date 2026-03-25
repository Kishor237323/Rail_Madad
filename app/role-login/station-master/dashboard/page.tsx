import { StationMasterDashboard } from "@/components/role-login/station-master-dashboard";

export default async function StationMasterDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ station?: string }>;
}) {
  const params = await searchParams;

  return <StationMasterDashboard username={params.station ?? ""} />;
}
