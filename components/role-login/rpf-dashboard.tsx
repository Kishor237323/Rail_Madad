"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, MapPin, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ComplaintStatus = "pending" | "in-progress" | "resolved";

type RpfComplaint = {
  complaintId: string;
  category: string;
  description: string;
  status: ComplaintStatus;
  priority: string;
  createdAt: string;
  train?: {
    name?: string;
    number?: string;
    coach?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

type RpfResponse = {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  complaints: RpfComplaint[];
};

type UserProfile = {
  name: string;
  role: string;
  district: string;
  station?: string;
  mobile: string;
};

export function RpfDashboard({ username }: { username: string }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState<RpfComplaint[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [updatingComplaintId, setUpdatingComplaintId] = useState<string | null>(null);

  const getStatsFromComplaints = (items: RpfComplaint[]) => ({
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    inProgress: items.filter((item) => item.status === "in-progress").length,
    resolved: items.filter((item) => item.status === "resolved").length,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rpf/assigned?username=${encodeURIComponent(username)}`);
        const data = (await response.json()) as Partial<RpfResponse>;

        if (!response.ok) {
          setStats({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
          setComplaints([]);
          return;
        }

        const list = Array.isArray(data.complaints) ? data.complaints : [];
        setComplaints(list);
        setStats(getStatsFromComplaints(list));
      } catch {
        setStats({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) {
        setProfile(null);
        return;
      }

      try {
        const response = await fetch(`/api/users/profile?username=${encodeURIComponent(username)}`);
        const data = (await response.json()) as { profile?: UserProfile };
        if (response.ok && data.profile) {
          setProfile(data.profile);
        }
      } catch {
        setProfile(null);
      }
    };

    loadProfile();
  }, [username]);

  const updateStatus = async (complaintId: string, status: ComplaintStatus) => {
    if (updatingComplaintId) return;

    const previous = complaints;
    const next = complaints.map((item) =>
      item.complaintId === complaintId ? { ...item, status } : item
    );

    setUpdatingComplaintId(complaintId);
    setComplaints(next);
    setStats(getStatsFromComplaints(next));

    try {
      const response = await fetch(`/api/rpf/complaints/${encodeURIComponent(complaintId)}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        setComplaints(previous);
        setStats(getStatsFromComplaints(previous));
      }
    } catch {
      setComplaints(previous);
      setStats(getStatsFromComplaints(previous));
    } finally {
      setUpdatingComplaintId(null);
    }
  };

  const activeAlerts = useMemo(() => stats.pending + stats.inProgress, [stats.inProgress, stats.pending]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">🚨 RPF Dashboard</h1>
        <p className="mt-1 text-slate-600">Security and crowd-related complaints routed to RPF.</p>
        {profile ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <p>👤 {profile.name}</p>
            <p>🚨 Role: {String(profile.role || "rpf").replace("_", " ")}</p>
            <p>📍 Station: {profile.station || "N/A"}</p>
            <p>🏙️ District: {profile.district || "N/A"}</p>
            <p>📱 Mobile: {profile.mobile || "N/A"}</p>
          </div>
        ) : username ? (
          <p className="mt-1 text-xs text-slate-500">Logged in as: {username}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Active Alerts</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{loading ? "..." : activeAlerts}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{loading ? "..." : stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{loading ? "..." : stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{loading ? "..." : stats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-6 text-sm text-slate-500">Loading RPF complaints...</CardContent>
        </Card>
      ) : complaints.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-slate-300">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="text-lg font-semibold text-slate-700">No security complaints yet</p>
            <p className="text-sm text-slate-500">Active Alerts: 0 · Pending: 0 · In Progress: 0 · Resolved: 0</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint) => (
            <Card key={complaint.complaintId} className="rounded-2xl border-red-200 bg-red-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-900">{complaint.complaintId}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{complaint.category}</Badge>
                  <Badge variant="outline">{complaint.status}</Badge>
                  <Badge variant="outline">Priority: {complaint.priority}</Badge>
                </div>
                <p>{complaint.description}</p>
                <p className="text-xs text-slate-500">
                  Train: {complaint.train?.name || "N/A"} {complaint.train?.number ? `(${complaint.train.number})` : ""}
                  {complaint.train?.coach ? ` · Coach ${complaint.train.coach}` : ""}
                </p>
                <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {complaint.location?.latitude && complaint.location?.longitude
                    ? `${complaint.location.latitude.toFixed(5)}, ${complaint.location.longitude.toFixed(5)}`
                    : "Location not available"}
                </p>
                <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  {new Date(complaint.createdAt).toLocaleString()}
                </p>
                {complaint.status === "resolved" ? (
                  <p className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Resolved
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Active alert
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => updateStatus(complaint.complaintId, "resolved")}
                      disabled={updatingComplaintId === complaint.complaintId}
                    >
                      Resolved
                    </Button>
                  </div>
                )}
               </CardContent>
             </Card>
           ))}
         </div>
       )}
     </div>
   );
 }
