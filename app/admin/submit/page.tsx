"use client";

import { ComplaintForm } from "@/components/complaint-form";

export default function AdminSubmitPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Register Complaint</h1>
        <p className="text-muted-foreground mt-1">
          Register a new complaint on behalf of a passenger
        </p>
      </div>

      {/* Complaint Form */}
      <ComplaintForm />
    </div>
  );
}
