import { RpfDashboard } from "@/components/role-login/rpf-dashboard";

export default async function RpfDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ rpf?: string }>;
}) {
  const params = await searchParams;

  return <RpfDashboard username={params.rpf ?? ""} />;
}
