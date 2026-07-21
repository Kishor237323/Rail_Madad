import { RoleLoginShell } from "@/components/role-login/shell";

export default function RoleLoginLayout({ children }: { children: React.ReactNode }) {
  return <RoleLoginShell>{children}</RoleLoginShell>;
}
