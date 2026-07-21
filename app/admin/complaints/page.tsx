"use client";

import { useEffect, useState } from "react";
import { ComplaintsTable } from "@/components/admin/complaints-table";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import type { Complaint } from "@/lib/types";

type ComplaintsApiResponse = {
  complaints?: Array<Omit<Complaint, "timestamp" | "resolvedAt"> & { timestamp: string; resolvedAt?: string | null }>;
  stats?: {
    total?: number;
    pending?: number;
    resolved?: number;
    critical?: number;
  };
};

export default function ComplaintsListPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, critical: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/complaints", { cache: "no-store" });
        const data = (await response.json()) as ComplaintsApiResponse;

        if (!response.ok) {
          setComplaints([]);
          setStats({ total: 0, pending: 0, resolved: 0, critical: 0 });
          return;
        }

        const mapped = (data.complaints || []).map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined,
        })) as Complaint[];

        setComplaints(mapped);
        setStats({
          total: Number(data.stats?.total || 0),
          pending: Number(data.stats?.pending || 0),
          resolved: Number(data.stats?.resolved || 0),
          critical: Number(data.stats?.critical || 0),
        });
      } catch {
        setComplaints([]);
        setStats({ total: 0, pending: 0, resolved: 0, critical: 0 });
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Complaints List</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all railway complaints
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-xl font-bold text-foreground">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-xl font-bold text-foreground">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints Table */}
      <ComplaintsTable complaints={complaints} />
    </div>
  );
}
