import { StationMasterDashboard } from "@/components/role-login/station-master-dashboard";

export default function StationMasterDashboardPage({
  searchParams,
}: {
  searchParams?: { station?: string | string[] };
}) {
  const username = typeof searchParams?.station === "string" ? searchParams.station : Array.isArray(searchParams?.station) ? searchParams.station[0] ?? "" : "";

  return <StationMasterDashboard username={username} />;
}
