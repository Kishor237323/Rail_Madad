"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, CheckCircle2, MapPin, Phone, Train, User, UserRoundCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type Role = "railway_staff" | "rpf" | "station_master";

const roleOptions: { label: string; value: Role; loginPath: string }[] = [
  { label: "Railway Staff", value: "railway_staff", loginPath: "/role-login/railway-staff" },
  { label: "RPF", value: "rpf", loginPath: "/role-login/rpf" },
  { label: "Station Master", value: "station_master", loginPath: "/role-login/station-master" },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState<Role>("railway_staff");
  const [district, setDistrict] = useState("");
  const [station, setStation] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showStationField = role === "rpf" || role === "station_master";
  const showTrainNumberField = role === "railway_staff";

  const selectedRole = useMemo(() => roleOptions.find((item) => item.value === role), [role]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !username.trim() || !password.trim() || !mobile.trim() || !district.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (showStationField && !station.trim()) {
      setError("Station is required for selected role.");
      return;
    }

    if (showTrainNumberField && !trainNumber.trim()) {
      setError("Train Number is required for Railway Staff.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          password,
          mobile: mobile.trim(),
          role,
          district: district.trim(),
          station: showStationField ? station.trim() : undefined,
          train_number: showTrainNumberField ? trainNumber.trim() : undefined,
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(data.error || "Unable to register user.");
        return;
      }

      setSuccess(data.message || "Registration successful. Please login using your credentials.");
      setPassword("");
    } catch {
      setError("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl rounded-2xl border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-900">📝 User Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="reg-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="reg-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="rounded-xl pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-username">Username</Label>
              <div className="relative">
                <UserRoundCog className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="reg-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose username"
                  className="rounded-xl pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-mobile">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="reg-mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile"
                  className="rounded-xl pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-role">Role</Label>
              <select
                id="reg-role"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-district">District</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="reg-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Enter district"
                  className="rounded-xl pl-9"
                />
              </div>
            </div>

            {showStationField ? (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="reg-station">Station</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="reg-station"
                    value={station}
                    onChange={(e) => setStation(e.target.value)}
                    placeholder="Enter station"
                    className="rounded-xl pl-9"
                  />
                </div>
              </div>
            ) : null}

            {showTrainNumberField ? (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="reg-train-number">Train Number</Label>
                <div className="relative">
                  <Train className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="reg-train-number"
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value)}
                    placeholder="Enter train number (e.g., 12951)"
                    className="rounded-xl pl-9"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? (
            <p className="inline-flex items-center gap-1 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="rounded-xl bg-[#0B3C5D] hover:bg-[#092f49]" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>

            {selectedRole ? (
              <Button asChild type="button" variant="outline" className="rounded-xl">
                <Link href={selectedRole.loginPath}>Go to {selectedRole.label} Login</Link>
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
