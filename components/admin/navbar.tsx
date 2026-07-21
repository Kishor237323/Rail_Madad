"use client";

import { Bell, Search, User, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export function AdminNavbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search complaints, users..."
          className="pl-10 bg-secondary border-border"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {darkMode ? (
            <Sun className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>

        {!mounted ? (
          <>
            <Button variant="ghost" size="icon" className="relative" disabled>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" className="flex items-center gap-2 px-2" disabled>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
            </Button>
          </>
        ) : (
          <>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-[10px]">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-foreground">New High Priority Complaint</span>
              <span className="text-xs text-muted-foreground">Medical emergency reported on Train 12345</span>
              <span className="text-xs text-muted-foreground">2 minutes ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-foreground">Complaint Resolved</span>
              <span className="text-xs text-muted-foreground">CMP-2024-001234 marked as resolved</span>
              <span className="text-xs text-muted-foreground">15 minutes ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-foreground">AI Classification Updated</span>
              <span className="text-xs text-muted-foreground">Model accuracy improved to 95.2%</span>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">Admin User</span>
                <span className="text-xs text-muted-foreground">Railway Staff</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="h-3.5 w-3.5" />
                  Signing out...
                </span>
              ) : (
                "Sign out"
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          </>
        )}
      </div>
    </header>
  );
}
