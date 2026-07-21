"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export function RoleLoginForm({
  title,
  redirectTo,
  passUsernameInQuery,
  queryParamName,
  loginEndpoint,
}: {
  title: string;
  redirectTo?: string;
  passUsernameInQuery?: boolean;
  queryParamName?: string;
  loginEndpoint?: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (loginEndpoint) {
      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setLoading(false);
        setError(data.error || "Invalid credentials.");
        return;
      }
    }

    setLoading(false);

    if (redirectTo) {
      if (passUsernameInQuery) {
        const queryKey = queryParamName || "staff";
        const target = `${redirectTo}?${queryKey}=${encodeURIComponent(username.trim())}`;
        router.push(target);
        return;
      }

      router.push(redirectTo);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md rounded-2xl border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild variant="ghost" className="mb-3 px-0 text-slate-600 hover:text-slate-900">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="role-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="rounded-xl pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="role-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="rounded-xl pl-9"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" className="w-full rounded-xl bg-[#0B3C5D] hover:bg-[#092f49]" disabled={loading}>
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
