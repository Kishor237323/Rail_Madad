import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/server/db";

type ComplaintDoc = {
  category?: string;
  status?: string;
  priority?: string;
  createdAt?: Date | string;
  resolvedAt?: Date | string | null;
};

const toDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(value as string | Date);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

export async function GET() {
  try {
    const db = await getDatabase();
    const complaints = await db
      .collection<ComplaintDoc>("complaints")
      .find({}, { projection: { category: 1, status: 1, priority: 1, createdAt: 1, resolvedAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    const total = complaints.length;
    const pending = complaints.filter((c) => String(c.status || "pending") === "pending").length;
    const inProgress = complaints.filter((c) => String(c.status || "pending") === "in-progress").length;
    const resolved = complaints.filter((c) => String(c.status || "pending") === "resolved").length;
    const highPriority = complaints.filter((c) => String(c.priority || "normal") === "high").length;

    const resolvedWithTimes = complaints.filter((c) => toDate(c.createdAt) && toDate(c.resolvedAt));
    const avgResponseTimeHours = resolvedWithTimes.length
      ? resolvedWithTimes.reduce((sum, complaint) => {
          const createdAt = toDate(complaint.createdAt)!;
          const resolvedAt = toDate(complaint.resolvedAt)!;
          return sum + (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        }, 0) / resolvedWithTimes.length
      : 0;

    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

    const categoryCounts = new Map<string, number>();
    const priorityCounts = new Map<string, number>();
    const statusCounts = new Map<string, number>();

    const today = new Date();
    const dateKeys: string[] = [];
    const trendMap = new Map<string, { date: string; complaints: number; resolved: number }>();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dateKeys.push(key);
      trendMap.set(key, {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        complaints: 0,
        resolved: 0,
      });
    }

    const hourlyMap = new Map<string, number>();
    for (let h = 0; h < 24; h++) {
      hourlyMap.set(`${pad2(h)}:00`, 0);
    }

    for (const complaint of complaints) {
      const category = String(complaint.category || "others");
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);

      const priority = String(complaint.priority || "normal");
      priorityCounts.set(priority, (priorityCounts.get(priority) || 0) + 1);

      const status = String(complaint.status || "pending");
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);

      const createdAt = toDate(complaint.createdAt);
      if (createdAt) {
        const createdKey = createdAt.toISOString().slice(0, 10);
        const point = trendMap.get(createdKey);
        if (point) point.complaints += 1;

        const hourLabel = `${pad2(createdAt.getHours())}:00`;
        hourlyMap.set(hourLabel, (hourlyMap.get(hourLabel) || 0) + 1);
      }

      const resolvedAt = toDate(complaint.resolvedAt);
      if (resolvedAt) {
        const resolvedKey = resolvedAt.toISOString().slice(0, 10);
        const point = trendMap.get(resolvedKey);
        if (point) point.resolved += 1;
      }
    }

    return NextResponse.json({
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        highPriority,
        avgResponseTimeHours: Number(avgResponseTimeHours.toFixed(1)),
        resolutionRate,
      },
      categoryData: Array.from(categoryCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
      priorityData: Array.from(priorityCounts.entries()).map(([name, value]) => ({ name, value })),
      statusData: Array.from(statusCounts.entries()).map(([name, value]) => ({ name, value })),
      trendData: dateKeys.map((key) => trendMap.get(key)).filter(Boolean),
      hourlyData: Array.from(hourlyMap.entries()).map(([hour, complaints]) => ({ hour, complaints })),
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch analytics." }, { status: 500 });
  }
}
