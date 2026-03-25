"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  Home,
  Menu,
  NotebookPen,
  Shield,
  Train,
  UserCog,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/role-login/railway-staff", label: "Railway Staff Login", icon: Train },
  { href: "/role-login/rpf", label: "RPF Login", icon: Shield },
  { href: "/role-login/station-master", label: "Station Master Login", icon: Building2 },
  { href: "/role-login/register", label: "📝 Register", icon: NotebookPen },
];

export function RoleLoginShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isRoleLoginPage =
    pathname === "/role-login/railway-staff" ||
    pathname === "/role-login/rpf" ||
    pathname === "/role-login/station-master" ||
    pathname === "/role-login/register";

  useEffect(() => {
    if (isRoleLoginPage) {
      setSidebarOpen(false);
    }
  }, [isRoleLoginPage]);

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          {!isRoleLoginPage ? (
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          ) : null}

          <div className="inline-flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B3C5D] text-white">
              <UserCog className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Rail Madad AI</p>
              <p className="text-xs text-slate-500">Role-based Login Access</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex">
        <aside
          className={cn(
            "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 border-r border-slate-800 bg-[#111827] p-4 text-white shadow-xl transition-transform duration-300 ease-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    isActive
                      ? "bg-white/20 text-white shadow"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="fixed inset-0 top-16 z-30 bg-slate-900/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <main className={cn("w-full p-4 sm:p-6 lg:p-8", sidebarOpen ? "lg:pl-80" : "")}>{children}</main>
      </div>
    </div>
  );
}
