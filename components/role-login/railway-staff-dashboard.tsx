"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Filter,
  MapPin,
  PlayCircle,
  ShieldAlert,
  Train,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ComplaintStatus = "pending" | "in-progress" | "resolved";
type ComplaintPriority = "normal" | "high";

type StaffComplaint = {
  id: string;
  train: string;
  coach: string;
  category: string;
  description: string;
  location?: string;
  reportedAt: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  image?: string;
  fullDescription: string;
};

const isEmergencyCategory = (category: string) => {
  const lower = category.toLowerCase();
  return lower.includes("medical") || lower.includes("fire") || lower.includes("security");
};

type DashboardComplaintResponse = {
  complaintId?: string;
  imagePath?: string | null;
  train?: {
    name?: string;
    number?: string;
    coach?: string;
  };
  category?: string;
  description?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  } | null;
  priority?: ComplaintPriority;
  status?: ComplaintStatus;
  createdAt?: string;
}

type UserProfile = {
  name: string;
  role: string;
  district: string;
  station?: string;
  train_number?: string;
  mobile: string;
};

export function RailwayStaffDashboard({ staffUsername }: { staffUsername: string }) {
  const [complaints, setComplaints] = useState<StaffComplaint[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [coachFilter, setCoachFilter] = useState<string>("all");
  const [coachView, setCoachView] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadAssignedComplaints = async () => {
      if (!staffUsername) {
        setComplaints([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/railway-staff/assigned?username=${encodeURIComponent(staffUsername)}`
        );
        const data = (await response.json()) as { complaints?: DashboardComplaintResponse[] };

        if (!response.ok || !data.complaints) {
          setComplaints([]);
          return;
        }

        const mapped = data.complaints.map((item) => {
          const date = item.createdAt ? new Date(item.createdAt) : new Date();
          return {
            id: item.complaintId || "RM00000000",
            train: `${item.train?.name || "Train"}${item.train?.number ? ` (${item.train.number})` : ""}`,
            coach: item.train?.coach || "NA",
            category: item.category || "others",
            description: item.description || "No description provided.",
            location:
              item.location?.latitude && item.location?.longitude
                ? `${item.location.latitude.toFixed(5)}, ${item.location.longitude.toFixed(5)}`
                : "Not available",
            reportedAt: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            priority: item.priority || "normal",
            status: item.status || "pending",
            image: item.imagePath || undefined,
            fullDescription: item.description || "No description provided.",
          } as StaffComplaint;
        });

        setComplaints(mapped);
      } catch {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssignedComplaints();
  }, [staffUsername]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!staffUsername) {
        setProfile(null);
        return;
      }

      try {
        const response = await fetch(`/api/users/profile?username=${encodeURIComponent(staffUsername)}`);
        const data = (await response.json()) as { profile?: UserProfile };
        if (response.ok && data.profile) {
          setProfile(data.profile);
        }
      } catch {
        setProfile(null);
      }
    };

    loadProfile();
  }, [staffUsername]);

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "pending").length;
  const inProgress = complaints.filter((c) => c.status === "in-progress").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  const categories = Array.from(new Set(complaints.map((c) => c.category)));
  const coaches = Array.from(new Set(complaints.map((c) => c.coach)));

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter;
      const matchesCoach = coachFilter === "all" || complaint.coach === coachFilter;
      return matchesStatus && matchesCategory && matchesCoach;
    });
  }, [complaints, statusFilter, categoryFilter, coachFilter]);

  const complaintsByCoach = useMemo(() => {
    const grouped: Record<string, StaffComplaint[]> = {};
    for (const complaint of filteredComplaints) {
      if (!grouped[complaint.coach]) grouped[complaint.coach] = [];
      grouped[complaint.coach].push(complaint);
    }
    return grouped;
  }, [filteredComplaints]);

  const updateStatus = async (id: string, status: ComplaintStatus) => {
    const previous = complaints;
    setComplaints((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));

    try {
      const response = await fetch(`/api/railway-staff/complaints/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        setComplaints(previous);
      }
    } catch {
      setComplaints(previous);
    }
  };

  const renderCard = (complaint: StaffComplaint) => {
    const emergency = isEmergencyCategory(complaint.category);

    return (
      <Card
        key={complaint.id}
        className={`rounded-2xl border shadow-sm ${
          emergency ? "border-red-300 bg-red-50/40" : "border-slate-200 bg-white"
        }`}
      >
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{complaint.id}</p>
              <p className="text-xs text-slate-500">{complaint.train}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Coach: {complaint.coach}</Badge>
              <Badge
                className={
                  complaint.priority === "high"
                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                }
              >
                {complaint.priority === "high" ? "High" : "Normal"}
              </Badge>
            </div>
          </div>

          {emergency ? (
            <p className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
              <ShieldAlert className="h-3.5 w-3.5" />
              HIGH PRIORITY
            </p>
          ) : null}

          <div className="grid gap-1 text-sm text-slate-700">
            <p>
              <span className="font-medium">Category:</span> {complaint.category}
            </p>
            <p>
              <span className="font-medium">Description:</span> {complaint.description}
            </p>
            <p>
              <span className="font-medium">Location:</span> {complaint.location || "Not available"}
            </p>
            <p>
              <span className="font-medium">Time:</span> {complaint.reportedAt}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => updateStatus(complaint.id, "in-progress")}
              disabled={complaint.status === "in-progress" || complaint.status === "resolved"}
            >
              <PlayCircle className="mr-1 h-4 w-4" />
              Mark In Progress
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => updateStatus(complaint.id, "resolved")}
              disabled={complaint.status === "resolved"}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Mark Resolved
            </Button>
            {complaint.image ? (
              <Button asChild type="button" size="sm" variant="secondary">
                <a href={complaint.image} target="_blank" rel="noreferrer">
                  View Image
                </a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Railway Staff Dashboard</h1>
        <p className="mt-1 text-slate-600">
          View coach-wise assigned complaints, take action, and update status in real time.
        </p>
        {profile ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <p>👤 {profile.name}</p>
            <p>🚆 Role: {String(profile.role || "railway_staff").replace("_", " ")}</p>
            <p>🚆 Train Number: {profile.train_number || "N/A"}</p>
            <p>🏙️ District: {profile.district || "N/A"}</p>
            <p>📱 Mobile: {profile.mobile || "N/A"}</p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-500">
            Logged in as: <span className="font-semibold">{staffUsername || "Unknown staff"}</span>
          </p>
        )}
      </div>

      {showAlert && complaints.length > 0 ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-900">
          <p className="inline-flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4" />
            New complaint alert: {complaints[0].id} assigned to Coach {complaints[0].coach}.
          </p>
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowAlert(false)}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {loading ? (
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-6 text-sm text-slate-500">Loading assigned complaints...</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Complaints</p>
            <p className="mt-1 text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-amber-200 bg-amber-50/40">
          <CardContent className="p-4">
            <p className="text-sm text-amber-700">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{pending}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-blue-200 bg-blue-50/40">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">In Progress</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{inProgress}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-200 bg-green-50/40">
          <CardContent className="p-4">
            <p className="text-sm text-green-700">Resolved</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{resolved}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={coachFilter}
              onChange={(e) => setCoachFilter(e.target.value)}
            >
              <option value="all">All Coaches</option>
              {coaches.map((coach) => (
                <option key={coach} value={coach}>
                  {coach}
                </option>
              ))}
            </select>

            <Button type="button" variant="outline" onClick={() => setCoachView((prev) => !prev)}>
              {coachView ? "List View" : "Coach View"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Assigned Complaints</h2>

        {!loading && coachView ? (
          <div className="space-y-4">
            {Object.keys(complaintsByCoach).length === 0 ? (
              <Card className="rounded-2xl border-slate-200">
                <CardContent className="p-6 text-sm text-slate-500">No complaints for selected filters.</CardContent>
              </Card>
            ) : (
              Object.entries(complaintsByCoach).map(([coach, coachComplaints]) => (
                <Card key={coach} className="rounded-2xl border-slate-200">
                  <CardHeader>
                    <CardTitle className="inline-flex items-center gap-2 text-base">
                      <Train className="h-4 w-4" />
                      Coach {coach}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">{coachComplaints.map((c) => renderCard(c))}</CardContent>
                </Card>
              ))
            )}
          </div>
        ) : !loading ? (
          filteredComplaints.length === 0 ? (
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-6 text-sm text-slate-500">No assigned complaints yet.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">{filteredComplaints.map((complaint) => renderCard(complaint))}</div>
          )
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Assigned", state: "Completed", done: true },
          { label: "In Progress", state: "Active", done: false },
          { label: "Resolved", state: "Pending", done: false },
        ].map((step) => (
          <Card key={step.label} className="rounded-2xl border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{step.label}</p>
              <p className="mt-1 font-semibold text-slate-900">{step.state}</p>
              {step.done ? (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </p>
              ) : (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Awaiting update
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
