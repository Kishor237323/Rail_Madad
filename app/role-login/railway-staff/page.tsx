import { RoleLoginForm } from "@/components/role-login/role-login-form";

export default function RailwayStaffLoginPage() {
  return (
    <RoleLoginForm
      title="Railway Staff Login"
      redirectTo="/role-login/dashboard"
      passUsernameInQuery
      queryParamName="staff"
      loginEndpoint="/api/railway-staff/login"
    />
  );
}
