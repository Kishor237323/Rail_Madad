import { RpfDashboard } from "@/components/role-login/rpf-dashboard";

export default function RpfDashboardPage({
  searchParams,
}: {
  searchParams?: { rpf?: string | string[] };
}) {
  const username = typeof searchParams?.rpf === "string" ? searchParams.rpf : Array.isArray(searchParams?.rpf) ? searchParams.rpf[0] ?? "" : "";

  return <RpfDashboard username={username} />;
}
