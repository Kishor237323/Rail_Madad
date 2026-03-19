import { Header } from "@/components/header";
import { StatsCards } from "@/components/admin/stats-cards";
import { ComplaintsChart, CategoryChart } from "@/components/admin/charts";
import { ComplaintsTable } from "@/components/admin/complaints-table";
import { mockComplaints, getComplaintStats, getTimeSeriesData, getCategoryDistribution } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users, Zap } from "lucide-react";

export default function AdminDashboard() {
  const stats = getComplaintStats();
  const timeSeriesData = getTimeSeriesData();
  const categoryData = getCategoryDistribution();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage railway complaints in real-time
              </p>
            </div>
            <Badge variant="outline" className="hidden sm:flex gap-2 py-2 px-4">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.resolutionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold text-foreground">{stats.avgResponseTime}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI Accuracy</p>
                  <p className="text-2xl font-bold text-foreground">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Users className="h-6 w-6 text-warning-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                  <p className="text-2xl font-bold text-foreground">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ComplaintsChart data={timeSeriesData} />
          <CategoryChart data={categoryData} />
        </div>

        {/* Complaints Table */}
        <ComplaintsTable complaints={mockComplaints} />
      </main>
    </div>
  );
}
