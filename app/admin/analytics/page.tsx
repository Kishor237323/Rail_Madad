"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, PieChartIcon, Activity } from "lucide-react";

const COLORS = ["#0B3C5D", "#FF6B00", "#16a34a", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f43f5e"];

type AnalyticsResponse = {
  stats?: {
    total?: number;
    pending?: number;
    inProgress?: number;
    resolved?: number;
    highPriority?: number;
    avgResponseTimeHours?: number;
    resolutionRate?: number;
  };
  categoryData?: Array<{ category: string; count: number }>;
  priorityData?: Array<{ name: string; value: number }>;
  statusData?: Array<{ name: string; value: number }>;
  trendData?: Array<{ date: string; complaints: number; resolved: number }>;
  hourlyData?: Array<{ hour: string; complaints: number }>;
};

const emptyStats = {
  total: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0,
  highPriority: 0,
  avgResponseTimeHours: 0,
  resolutionRate: 0,
};

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(emptyStats);
  const [categoryData, setCategoryData] = useState<Array<{ category: string; count: number }>>([]);
  const [priorityDataRaw, setPriorityDataRaw] = useState<Array<{ name: string; value: number }>>([]);
  const [statusDataRaw, setStatusDataRaw] = useState<Array<{ name: string; value: number }>>([]);
  const [trendData, setTrendData] = useState<Array<{ date: string; complaints: number; resolved: number }>>([]);
  const [hourlyData, setHourlyData] = useState<Array<{ hour: string; complaints: number }>>([]);
  const [trendRange, setTrendRange] = useState<"7" | "30">("30");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/analytics", { cache: "no-store" });
        const data = (await response.json()) as AnalyticsResponse;

        if (!response.ok) {
          setStats(emptyStats);
          setCategoryData([]);
          setPriorityDataRaw([]);
          setStatusDataRaw([]);
          setTrendData([]);
          setHourlyData([]);
          return;
        }

        setStats({
          total: Number(data.stats?.total || 0),
          pending: Number(data.stats?.pending || 0),
          inProgress: Number(data.stats?.inProgress || 0),
          resolved: Number(data.stats?.resolved || 0),
          highPriority: Number(data.stats?.highPriority || 0),
          avgResponseTimeHours: Number(data.stats?.avgResponseTimeHours || 0),
          resolutionRate: Number(data.stats?.resolutionRate || 0),
        });
        setCategoryData(
          Array.isArray(data.categoryData)
            ? data.categoryData.filter(
                (item): item is { category: string; count: number } =>
                  !!item && typeof item.category === "string" && typeof item.count === "number"
              )
            : []
        );
        setPriorityDataRaw(
          Array.isArray(data.priorityData)
            ? data.priorityData.filter(
                (item): item is { name: string; value: number } =>
                  !!item && typeof item.name === "string" && typeof item.value === "number"
              )
            : []
        );
        setStatusDataRaw(
          Array.isArray(data.statusData)
            ? data.statusData.filter(
                (item): item is { name: string; value: number } =>
                  !!item && typeof item.name === "string" && typeof item.value === "number"
              )
            : []
        );
        setTrendData(
          Array.isArray(data.trendData)
            ? data.trendData.filter(
                (item): item is { date: string; complaints: number; resolved: number } =>
                  !!item &&
                  typeof item.date === "string" &&
                  typeof item.complaints === "number" &&
                  typeof item.resolved === "number"
              )
            : []
        );
        setHourlyData(
          Array.isArray(data.hourlyData)
            ? data.hourlyData.filter(
                (item): item is { hour: string; complaints: number } =>
                  !!item && typeof item.hour === "string" && typeof item.complaints === "number"
              )
            : []
        );
      } catch {
        setStats(emptyStats);
        setCategoryData([]);
        setPriorityDataRaw([]);
        setStatusDataRaw([]);
        setTrendData([]);
        setHourlyData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Transform category data for charts
  const barChartData = categoryData.map((item) => ({
    category: CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] || item.category,
    count: item.count,
  }));

  const priorityColorMap: Record<string, string> = {
    critical: "#dc2626",
    high: "#f97316",
    medium: "#f59e0b",
    normal: "#f59e0b",
    low: "#22c55e",
  };

  const priorityData = useMemo(
    () =>
      priorityDataRaw.map((item) => ({
        name: item.name,
        value: item.value,
        color: priorityColorMap[item.name.toLowerCase()] || "#64748b",
      })),
    [priorityDataRaw]
  );

  const statusData = useMemo(() => {
    const colorMap: Record<string, string> = {
      pending: "#f59e0b",
      "in-progress": "#3b82f6",
      resolved: "#22c55e",
    };
    return statusDataRaw.map((item) => ({
      name: item.name,
      value: item.value,
      color: colorMap[item.name.toLowerCase()] || "#64748b",
    }));
  }, [statusDataRaw]);

  const displayedTrendData = useMemo(
    () => (trendRange === "7" ? trendData.slice(-7) : trendData),
    [trendData, trendRange]
  );

  const hasTrendData = displayedTrendData.length > 0;
  const hasCategoryData = barChartData.length > 0;
  const hasPriorityData = priorityData.length > 0;
  const hasStatusData = statusData.length > 0;
  const hasHourlyData = hourlyData.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive insights into complaint patterns and resolution metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Complaints</p>
                <p className="text-3xl font-bold text-foreground">{loading ? "..." : stats.total}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">Live from database</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-3xl font-bold text-foreground">{loading ? "..." : `${stats.resolutionRate}%`}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">Calculated from resolved / total</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-3xl font-bold text-foreground">{loading ? "..." : `${stats.avgResponseTimeHours}h`}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">From complaints with `resolvedAt`</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-3xl font-bold text-foreground">{loading ? "..." : stats.highPriority}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">Priority = high</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <PieChartIcon className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Complaint Trends (Last {trendRange} Days)</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={trendRange === "7" ? "default" : "outline"}
                onClick={() => setTrendRange("7")}
              >
                7 Days
              </Button>
              <Button
                type="button"
                size="sm"
                variant={trendRange === "30" ? "default" : "outline"}
                onClick={() => setTrendRange("30")}
              >
                30 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ height: 350 }}>
            {!isClient || (!hasTrendData && !loading) ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {loading ? "Loading trend chart..." : "No trend data available"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayedTrendData}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B3C5D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0B3C5D" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#ffffff", 
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="complaints" stroke="#0B3C5D" fillOpacity={1} fill="url(#colorComplaints)" strokeWidth={2} name="Total Complaints" />
                <Area type="monotone" dataKey="resolved" stroke="#22c55e" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category & Priority Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Complaints by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 350 }}>
              {!isClient || (!hasCategoryData && !loading) ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {loading ? "Loading category chart..." : "No category data available"}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="count" fill="#0B3C5D" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Priority & Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4" style={{ height: 350 }}>
              <div>
                <p className="text-sm text-muted-foreground text-center mb-2">By Priority</p>
                {!isClient || (!hasPriorityData && !loading) ? (
                  <div className="flex h-[90%] items-center justify-center text-xs text-muted-foreground">
                    {loading ? "Loading..." : "No data"}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground text-center mb-2">By Status</p>
                {!isClient || (!hasStatusData && !loading) ? (
                  <div className="flex h-[90%] items-center justify-center text-xs text-muted-foreground">
                    {loading ? "Loading..." : "No data"}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Complaints by Hour of Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: 250 }}>
            {!isClient || (!hasHourlyData && !loading) ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {loading ? "Loading hourly chart..." : "No hourly data available"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#ffffff", 
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="complaints" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
