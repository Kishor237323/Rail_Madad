"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck, Train } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = (await response.json()) as { error?: string; redirectTo?: string };

      if (!response.ok) {
        setError(data.error ?? "Invalid credentials");
        return;
      }

      const nextPath = searchParams.get("next");
      router.push(nextPath || data.redirectTo || "/admin/analytics");
    } catch {
      setError("Unable to login right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 to-white p-4">
      <Button
        asChild
        variant="ghost"
        className="absolute left-4 top-4 rounded-xl text-slate-700 hover:bg-slate-100"
      >
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <Card className="w-full max-w-md rounded-2xl border-slate-200 shadow-xl shadow-slate-200/60">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Train className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">🔐 Admin Login – Rail Madad</CardTitle>
          <CardDescription>
            Secure access for authorized administrators only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
                autoComplete="current-password"
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Admin-only access
              </p>
              <p className="mt-1">No signup or guest access is available.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
