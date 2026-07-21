import { RoleLoginForm } from "@/components/role-login/role-login-form";

export default function StationMasterLoginPage() {
  return (
    <RoleLoginForm
      title="Station Master Login"
      redirectTo="/role-login/station-master/dashboard"
      passUsernameInQuery
      queryParamName="station"
      loginEndpoint="/api/station-master/login"
    />
  );
}
