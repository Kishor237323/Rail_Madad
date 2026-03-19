"use client";

import { StatsCards } from "@/components/admin/stats-cards";
import { ComplaintsChart, CategoryChart } from "@/components/admin/charts";
import { ComplaintsTable } from "@/components/admin/complaints-table";
import { mockComplaints, getComplaintStats, getTimeSeriesData, getCategoryDistribution } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users, Zap, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR issues
const ComplaintMap = dynamic(() => import("@/components/admin/complaint-map").then(mod => mod.ComplaintMap), {
  ssr: false,
  loading: () => (
    <Card className="h-[400px] flex items-center justify-center">
      <div className="text-muted-foreground">Loading map...</div>
    </Card>
  ),
});

export default function AdminDashboard() {
  const stats = getComplaintStats();
  const timeSeriesData = getTimeSeriesData();
  const categoryData = getCategoryDistribution();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage railway complaints in real-time
          </p>
        </div>
        <Badge variant="outline" className="flex gap-2 py-2 px-4 bg-success/10 border-success/30">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-success">Live</span>
        </Badge>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.resolutionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgResponseTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Accuracy</p>
                <p className="text-2xl font-bold text-foreground">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplaintsChart data={timeSeriesData} />
        <CategoryChart data={categoryData} />
      </div>

      {/* Map Section */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Live Complaint Map
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {mockComplaints.length} Active Complaints
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] rounded-b-lg overflow-hidden">
            <ComplaintMap complaints={mockComplaints} />
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <ComplaintsTable complaints={mockComplaints} />
    </div>
  );
}
