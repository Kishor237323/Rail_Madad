"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getComplaintStats, getCategoryDistribution, mockComplaints } from "@/lib/mock-data";
import { CATEGORY_LABELS } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, PieChartIcon, Activity } from "lucide-react";

const COLORS = ["#0B3C5D", "#FF6B00", "#16a34a", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f43f5e"];

export default function AnalyticsPage() {
  const stats = getComplaintStats();
  const categoryData = getCategoryDistribution();

  // Transform category data for charts
  const barChartData = categoryData.map((item) => ({
    category: CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] || item.category,
    count: item.count,
  }));

  // Create trend data (last 30 days)
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      complaints: Math.floor(20 + Math.random() * 40),
      resolved: Math.floor(15 + Math.random() * 30),
    };
  });

  // Priority distribution
  const priorityData = [
    { name: "Critical", value: mockComplaints.filter(c => c.priority === "critical").length, color: "#dc2626" },
    { name: "High", value: mockComplaints.filter(c => c.priority === "high").length, color: "#f97316" },
    { name: "Medium", value: mockComplaints.filter(c => c.priority === "medium").length, color: "#f59e0b" },
    { name: "Low", value: mockComplaints.filter(c => c.priority === "low").length, color: "#22c55e" },
  ];

  // Status distribution
  const statusData = [
    { name: "Pending", value: stats.pending, color: "#f59e0b" },
    { name: "In Progress", value: stats.inProgress, color: "#3b82f6" },
    { name: "Resolved", value: stats.resolved, color: "#22c55e" },
  ];

  // Hourly distribution (simulated)
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    complaints: Math.floor(5 + Math.random() * 25),
  }));

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
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-xs text-success">+12% from last month</span>
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
                <p className="text-3xl font-bold text-foreground">{stats.resolutionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-xs text-success">+5% improvement</span>
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
                <p className="text-3xl font-bold text-foreground">{stats.avgResponseTime}h</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-success" />
                  <span className="text-xs text-success">-2h faster</span>
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
                <p className="text-3xl font-bold text-foreground">{stats.critical}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-success" />
                  <span className="text-xs text-success">-3 from yesterday</span>
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
          <CardTitle>Complaint Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
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
            <div className="h-[350px]">
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
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Priority & Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 h-[350px]">
              <div>
                <p className="text-sm text-muted-foreground text-center mb-2">By Priority</p>
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
              </div>
              <div>
                <p className="text-sm text-muted-foreground text-center mb-2">By Status</p>
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
          <div className="h-[250px]">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
