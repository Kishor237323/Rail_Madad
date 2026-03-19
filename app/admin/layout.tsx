import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminNavbar } from "@/components/admin/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
