import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from "./types";

const categories: ComplaintCategory[] = [
  "cleanliness",
  "infrastructure",
  "electrical",
  "overcrowding",
  "security",
  "medical",
  "catering",
  "water",
  "other",
];

const priorities: ComplaintPriority[] = ["low", "medium", "high", "critical"];
const statuses: ComplaintStatus[] = ["pending", "in-progress", "resolved", "closed"];

const trainNumbers = ["12301", "12302", "12951", "12952", "22691", "16527", "12723", "12724"];
const coaches = ["S1", "S2", "S3", "S4", "S5", "B1", "B2", "A1", "A2", "GEN"];
const names = [
  "Rahul Sharma",
  "Priya Patel",
  "Amit Kumar",
  "Sneha Gupta",
  "Vikram Singh",
  "Ananya Reddy",
  "Rajesh Verma",
  "Kavita Nair",
  "Suresh Pillai",
  "Meera Joshi",
];

const descriptions: Record<ComplaintCategory, string[]> = {
  cleanliness: [
    "The toilet in the coach is extremely dirty and unusable",
    "Food waste scattered in the aisle near seat 42",
    "Dustbin overflowing and not emptied since journey started",
    "Water spillage near the washbasin area",
  ],
  infrastructure: [
    "Seat cushion is torn and springs are exposed",
    "Window latch broken, unable to close window properly",
    "Door handle of the compartment not working",
    "Fan blade broken and making noise",
  ],
  electrical: [
    "Charging point not working near seat 25",
    "Light flickering in the coach continuously",
    "AC vent blowing hot air instead of cool air",
    "Reading light not functional",
  ],
  overcrowding: [
    "Too many unreserved passengers in reserved coach",
    "Emergency exit blocked by luggage and people",
    "Cannot move through the aisle due to overcrowding",
    "Pantry area congested with passengers",
  ],
  security: [
    "Suspicious unattended bag near coach entrance",
    "Unauthorized vendor entering reserved compartment",
    "Chain snatching attempt at station",
    "Passenger behaving suspiciously",
  ],
  medical: [
    "Co-passenger suffering from chest pain, need medical help",
    "Elderly person fainted, need medical assistance",
    "Child having high fever, need doctor",
    "Pregnant woman in distress",
  ],
  catering: [
    "Food served was stale and inedible",
    "Ordered meal not delivered after 2 hours",
    "Wrong food item served, different from order",
    "Water bottle seal was broken",
  ],
  water: [
    "No water supply in the washroom",
    "Water coming out dirty and smelly",
    "Water tap leaking continuously",
    "Drinking water dispenser not working",
  ],
  other: [
    "TTE not available for verification",
    "Loud music playing despite request to stop",
    "Bedding not provided as promised",
    "Wrong coach assignment",
  ],
};

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date;
}

export function generateMockComplaints(count: number): Complaint[] {
  const complaints: Complaint[] = [];

  for (let i = 0; i < count; i++) {
    const category = randomElement(categories);
    const status = randomElement(statuses);
    const timestamp = randomDate(30);
    const priority = randomElement(priorities);

    const complaint: Complaint = {
      id: `RM${(Date.now() - i * 1000000).toString(36).toUpperCase()}`,
      category,
      description: randomElement(descriptions[category]),
      location: {
        latitude: 12.9716 + (Math.random() - 0.5) * 10,
        longitude: 77.5946 + (Math.random() - 0.5) * 10,
        trainNumber: randomElement(trainNumbers),
        coachNumber: randomElement(coaches),
      },
      timestamp,
      priority,
      status,
      aiClassification: {
        category,
        confidence: 0.7 + Math.random() * 0.25,
        detectedIssues: [randomElement(descriptions[category])],
      },
      passengerInfo: {
        name: randomElement(names),
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        pnr: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      },
      assignedTo: status !== "pending" ? `Staff-${Math.floor(Math.random() * 100)}` : undefined,
      resolvedAt: status === "resolved" || status === "closed" ? new Date(timestamp.getTime() + Math.random() * 86400000 * 3) : undefined,
      resolution: status === "resolved" || status === "closed" ? "Issue has been addressed and resolved." : undefined,
    };

    complaints.push(complaint);
  }

  return complaints.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const mockComplaints = generateMockComplaints(50);

export function getComplaintStats() {
  const total = mockComplaints.length;
  const pending = mockComplaints.filter((c) => c.status === "pending").length;
  const inProgress = mockComplaints.filter((c) => c.status === "in-progress").length;
  const resolved = mockComplaints.filter((c) => c.status === "resolved" || c.status === "closed").length;
  const critical = mockComplaints.filter((c) => c.priority === "critical").length;

  const byCategory = categories.reduce((acc, cat) => {
    acc[cat] = mockComplaints.filter((c) => c.category === cat).length;
    return acc;
  }, {} as Record<ComplaintCategory, number>);

  const avgResponseTime = mockComplaints
    .filter((c) => c.resolvedAt)
    .reduce((acc, c) => {
      const diff = c.resolvedAt!.getTime() - c.timestamp.getTime();
      return acc + diff / (1000 * 60 * 60); // hours
    }, 0) / resolved || 0;

  return {
    total,
    pending,
    inProgress,
    resolved,
    critical,
    byCategory,
    avgResponseTime: Math.round(avgResponseTime * 10) / 10,
    resolutionRate: Math.round((resolved / total) * 100),
  };
}

export function getTimeSeriesData() {
  const days = 7;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
    
    data.push({
      day: dayStr,
      complaints: Math.floor(20 + Math.random() * 30),
      resolved: Math.floor(15 + Math.random() * 25),
    });
  }
  
  return data;
}

export function getCategoryDistribution() {
  const stats = getComplaintStats();
  return Object.entries(stats.byCategory)
    .filter(([, count]) => count > 0)
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
