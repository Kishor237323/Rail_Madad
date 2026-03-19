export type ComplaintCategory = 
  | "cleanliness"
  | "infrastructure"
  | "electrical"
  | "overcrowding"
  | "security"
  | "medical"
  | "catering"
  | "water"
  | "other";

export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export type ComplaintStatus = "pending" | "in-progress" | "resolved" | "closed";

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  description: string;
  imageUrl?: string;
  location: {
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    trainNumber?: string;
    coachNumber?: string;
    station?: string;
  };
  timestamp: Date;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  aiClassification?: {
    category: ComplaintCategory;
    confidence: number;
    detectedIssues: string[];
  };
  passengerInfo: {
    name: string;
    phone: string;
    pnr?: string;
  };
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
}

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  cleanliness: "Cleanliness Issue",
  infrastructure: "Infrastructure Damage",
  electrical: "Electrical Fault",
  overcrowding: "Overcrowding",
  security: "Security Concern",
  medical: "Medical Emergency",
  catering: "Catering/Food Issue",
  water: "Water Supply Issue",
  other: "Other Issue",
};

export const PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};
