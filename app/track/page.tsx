"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MapPin,
  Train,
  User,
  Phone,
  FileText,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { mockComplaints } from "@/lib/mock-data";
import { CATEGORY_LABELS, STATUS_LABELS, PRIORITY_LABELS, type Complaint, type ComplaintStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<ComplaintStatus, { icon: typeof CheckCircle2; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: "text-warning-foreground", bgColor: "bg-warning/10" },
  "in-progress": { icon: AlertCircle, color: "text-primary", bgColor: "bg-primary/10" },
  resolved: { icon: CheckCircle2, color: "text-success", bgColor: "bg-success/10" },
  closed: { icon: CheckCircle2, color: "text-muted-foreground", bgColor: "bg-muted" },
};

function TrackPageContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  
  const [complaintId, setComplaintId] = useState(initialId);
  const [searchedId, setSearchedId] = useState(initialId);
  const [isSearching, setIsSearching] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(
    initialId ? mockComplaints.find((c) => c.id === initialId) || null : null
  );
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!complaintId.trim()) return;
    
    setIsSearching(true);
    setNotFound(false);
    setSearchedId(complaintId);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const found = mockComplaints.find(
      (c) => c.id.toLowerCase() === complaintId.toLowerCase()
    );
    
    if (found) {
      setComplaint(found);
      setNotFound(false);
    } else {
      setComplaint(null);
      setNotFound(true);
    }
    
    setIsSearching(false);
  };

  const StatusIcon = complaint ? statusConfig[complaint.status].icon : Clock;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Track Your Complaint
              </CardTitle>
              <CardDescription>
                Enter your complaint ID to check the current status and resolution progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="complaint-id" className="sr-only">
                    Complaint ID
                  </Label>
                  <Input
                    id="complaint-id"
                    placeholder="Enter Complaint ID (e.g., RMXYZ123)"
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="font-mono"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching || !complaintId.trim()}>
                  {isSearching ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Not Found State */}
          {notFound && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Complaint Not Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    No complaint found with ID: <span className="font-mono font-medium">{searchedId}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please check the ID and try again, or contact support at 139.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complaint Details */}
          {complaint && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card className={cn("border-l-4", {
                "border-l-warning": complaint.status === "pending",
                "border-l-primary": complaint.status === "in-progress",
                "border-l-success": complaint.status === "resolved" || complaint.status === "closed",
              })}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Complaint ID</p>
                      <p className="text-2xl font-mono font-bold text-foreground">{complaint.id}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-sm py-1.5 px-3",
                        statusConfig[complaint.status].bgColor,
                        statusConfig[complaint.status].color
                      )}
                    >
                      <StatusIcon className="h-4 w-4 mr-1.5" />
                      {STATUS_LABELS[complaint.status]}
                    </Badge>
                  </div>

                  {/* Progress Timeline */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      {["Submitted", "In Progress", "Resolved"].map((step, index) => {
                        const stepStatuses = [["pending"], ["in-progress"], ["resolved", "closed"]];
                        const isCompleted = stepStatuses.slice(0, index + 1).flat().some(s => 
                          s === complaint.status || 
                          (index < stepStatuses.findIndex(ss => ss.includes(complaint.status)))
                        );
                        const isCurrent = stepStatuses[index].includes(complaint.status);
                        
                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors",
                                isCurrent
                                  ? "bg-primary text-primary-foreground"
                                  : isCompleted
                                  ? "bg-success text-success-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {index + 1}
                            </div>
                            <span className={cn(
                              "text-xs",
                              isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                            )}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="relative h-1 bg-muted rounded-full">
                      <div
                        className="absolute h-1 bg-primary rounded-full transition-all"
                        style={{
                          width: complaint.status === "pending" 
                            ? "16%" 
                            : complaint.status === "in-progress" 
                            ? "50%" 
                            : "100%"
                        }}
                      />
                    </div>
                  </div>

                  {/* Category and Priority */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge variant="secondary">{CATEGORY_LABELS[complaint.category]}</Badge>
                    <Badge variant="outline">{PRIORITY_LABELS[complaint.priority]} Priority</Badge>
                  </div>

                  {/* Description */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-foreground">{complaint.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis */}
              {complaint.aiClassification && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">AI Classification</h3>
                        <p className="text-sm text-muted-foreground">
                          Category detected with {Math.round(complaint.aiClassification.confidence * 100)}% confidence
                        </p>
                        <div className="mt-3 space-y-1">
                          {complaint.aiClassification.detectedIssues.map((issue, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <ArrowRight className="h-3 w-3 text-primary" />
                              {issue}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Train className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Train Details</p>
                        <p className="font-medium text-foreground">
                          Train: {complaint.location.trainNumber || "N/A"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Coach: {complaint.location.coachNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">
                          {complaint.location.coordinates 
                            ? `${complaint.location.coordinates.latitude.toFixed(4)}, ${complaint.location.coordinates.longitude.toFixed(4)}`
                            : "Location not available"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="font-medium text-foreground">
                          {complaint.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned To</p>
                        <p className="font-medium text-foreground">
                          {complaint.assignedTo || "Not yet assigned"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resolution */}
              {complaint.resolution && (
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Resolution</h3>
                        <p className="text-muted-foreground">{complaint.resolution}</p>
                        {complaint.resolvedAt && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Resolved on: {complaint.resolvedAt.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Empty State */}
          {!complaint && !notFound && !initialId && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Enter Your Complaint ID
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    You can find your complaint ID in the confirmation message received after submitting your complaint.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
}
