"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    critical: number;
    avgResponseTime: number;
    resolutionRate: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Complaints",
      value: stats.total,
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending",
      value: stats.pending,
      change: "-5%",
      trend: "down",
      icon: Clock,
      color: "text-warning-foreground",
      bgColor: "bg-warning/10",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      change: "+18%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Critical",
      value: stats.critical,
      change: "-8%",
      trend: "down",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {card.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-success" />
                  )}
                  <span className="text-sm text-success">{card.change}</span>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
