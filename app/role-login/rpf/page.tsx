import { RoleLoginForm } from "@/components/role-login/role-login-form";

export default function RpfLoginPage() {
  return (
    <RoleLoginForm
      title="RPF Login"
      redirectTo="/role-login/rpf/dashboard"
      passUsernameInQuery
      queryParamName="rpf"
      loginEndpoint="/api/rpf/login"
    />
  );
}
