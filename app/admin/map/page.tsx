"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/lib/types";
import { MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import type { Complaint } from "@/lib/types";

const ComplaintMap = dynamic(
  () => import("@/components/admin/complaint-map").then((mod) => mod.ComplaintMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center bg-secondary rounded-lg">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    ),
  }
);

export default function MapViewPage() {
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, pending: 0, resolved: 0 });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/complaints", { cache: "no-store" });
        const data = (await response.json()) as {
          complaints?: Array<Omit<Complaint, "timestamp" | "resolvedAt"> & { timestamp: string; resolvedAt?: string | null }>;
          stats?: { total?: number; critical?: number; pending?: number; resolved?: number };
        };

        if (!response.ok) {
          setAllComplaints([]);
          setStats({ total: 0, critical: 0, pending: 0, resolved: 0 });
          return;
        }

        setAllComplaints(
          (data.complaints || []).map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp),
            resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined,
          })) as Complaint[]
        );
        setStats({
          total: Number(data.stats?.total || 0),
          critical: Number(data.stats?.critical || 0),
          pending: Number(data.stats?.pending || 0),
          resolved: Number(data.stats?.resolved || 0),
        });
      } catch {
        setAllComplaints([]);
        setStats({ total: 0, critical: 0, pending: 0, resolved: 0 });
      }
    };

    load();
  }, []);

  const filteredComplaints = useMemo(
    () =>
      allComplaints.filter((complaint) => {
        if (categoryFilter !== "all" && complaint.category !== categoryFilter) return false;
        if (priorityFilter !== "all" && complaint.priority !== priorityFilter) return false;
        if (statusFilter !== "all" && complaint.status !== statusFilter) return false;
        return true;
      }),
    [allComplaints, categoryFilter, priorityFilter, statusFilter]
  );

  const complaintsWithLocation = filteredComplaints.filter(
    (c) => c.location?.coordinates
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Complaint Map</h1>
          <p className="text-muted-foreground mt-1">
            Interactive map showing real-time complaint locations across India
          </p>
        </div>
        <Badge variant="outline" className="flex gap-2 py-2 px-4 bg-success/10 border-success/30">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-success">{complaintsWithLocation.length} Active</span>
        </Badge>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Filter Complaints</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm text-muted-foreground mb-1.5 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm text-muted-foreground mb-1.5 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm text-muted-foreground mb-1.5 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCategoryFilter("all");
                  setPriorityFilter("all");
                  setStatusFilter("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Complaint Locations
            </CardTitle>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">High</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-muted-foreground">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-success" />
                <span className="text-muted-foreground">Low</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] rounded-b-lg overflow-hidden">
            <ComplaintMap complaints={filteredComplaints} />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Complaints</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-destructive">{stats.critical}</p>
            <p className="text-sm text-muted-foreground">Critical Issues</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-success">{stats.resolved}</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
