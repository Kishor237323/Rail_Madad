"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Eye, MapPin, Train, User, Phone, Clock, Sparkles } from "lucide-react";
import type { Complaint, ComplaintCategory, ComplaintStatus, ComplaintPriority } from "@/lib/types";
import { CATEGORY_LABELS, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ComplaintsTableProps {
  complaints: Complaint[];
}

const statusColors: Record<ComplaintStatus, string> = {
  pending: "bg-warning/10 text-warning-foreground border-warning/30",
  "in-progress": "bg-primary/10 text-primary border-primary/30",
  resolved: "bg-success/10 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-muted",
};

const priorityColors: Record<ComplaintPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/10 text-warning-foreground",
  critical: "bg-destructive/10 text-destructive",
};

export function ComplaintsTable({ complaints: initialComplaints }: ComplaintsTableProps) {
  const [mounted, setMounted] = useState(false);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setComplaints(initialComplaints);
  }, [initialComplaints]);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(date);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(search.toLowerCase()) ||
      complaint.description.toLowerCase().includes(search.toLowerCase()) ||
      complaint.passengerInfo.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const updateStatus = (id: string, newStatus: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              resolvedAt: newStatus === "resolved" ? new Date() : c.resolvedAt,
            }
          : c
      )
    );
    if (selectedComplaint?.id === id) {
      setSelectedComplaint((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    }
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-sm text-muted-foreground">Loading complaints...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Recent Complaints</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-35">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Train</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.slice(0, 10).map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                    <TableCell>
                      <span className="text-sm">{CATEGORY_LABELS[complaint.category]}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {complaint.location.trainNumber || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityColors[complaint.priority]}>
                        {PRIORITY_LABELS[complaint.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[complaint.status]}>
                        {STATUS_LABELS[complaint.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {formatDate(complaint.timestamp)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredComplaints.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No complaints found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaint Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Complaint Details
                  <Badge variant="outline" className={statusColors[selectedComplaint.status]}>
                    {STATUS_LABELS[selectedComplaint.status]}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  ID: <span className="font-mono">{selectedComplaint.id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* AI Classification */}
                {selectedComplaint.aiClassification && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">AI Classification</span>
                      <Badge variant="secondary">
                        {Math.round(selectedComplaint.aiClassification.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Category: {CATEGORY_LABELS[selectedComplaint.aiClassification.category]}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                  <p className="text-foreground">{selectedComplaint.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Train className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Train / Coach</p>
                      <p className="font-medium text-foreground">
                        {selectedComplaint.location.trainNumber || "N/A"} / {selectedComplaint.location.coachNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium text-foreground">
                        {selectedComplaint.location.coordinates
                          ? `${selectedComplaint.location.coordinates.latitude.toFixed(4)}, ${selectedComplaint.location.coordinates.longitude.toFixed(4)}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Passenger</p>
                      <p className="font-medium text-foreground">{selectedComplaint.passengerInfo.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{selectedComplaint.passengerInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-medium text-foreground">
                        {formatDate(selectedComplaint.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">Update Status</h4>
                  <div className="flex gap-2">
                    {(["pending", "in-progress", "resolved", "closed"] as ComplaintStatus[]).map((status) => (
                      <Button
                        key={status}
                        variant={selectedComplaint.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateStatus(selectedComplaint.id, status)}
                      >
                        {STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
