"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminNavbar } from "@/components/admin/navbar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin";

  if (isLoginPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="pl-64 transition-all duration-300">
        <AdminNavbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
