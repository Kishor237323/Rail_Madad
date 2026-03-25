import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/server/db";

type ComplaintDoc = {
	complaintId?: string;
	pnr?: string;
	category?: string;
	description?: string;
	status?: string;
	priority?: string;
	createdAt?: Date | string;
	resolvedAt?: Date | string | null;
	train?: {
		number?: string;
		coach?: string;
	};
	location?: {
		latitude?: number;
		longitude?: number;
	} | null;
};

const toIsoDate = (value: unknown) => {
	if (!value) return null;
	const date = new Date(value as string | Date);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const normalizeStatus = (value: unknown) => {
	const status = String(value || "pending").toLowerCase();
	if (status === "in progress") return "in-progress";
	if (["pending", "in-progress", "resolved", "closed"].includes(status)) return status;
	return "pending";
};

const normalizePriority = (value: unknown) => {
	const priority = String(value || "medium").toLowerCase();
	if (["low", "medium", "high", "critical"].includes(priority)) return priority;
	if (priority === "normal") return "medium";
	return "medium";
};

const normalizeCategory = (value: unknown) => {
	const category = String(value || "other").toLowerCase();
	const known = new Set([
		"cleanliness",
		"infrastructure",
		"electrical",
		"overcrowding",
		"security",
		"medical",
		"catering",
		"water",
		"other",
	]);
	if (known.has(category)) return category;
	if (category.includes("toilet") || category.includes("clean")) return "cleanliness";
	if (category.includes("light") || category.includes("electrical")) return "electrical";
	if (category.includes("water") || category.includes("tap")) return "water";
	if (category.includes("seat") || category.includes("coach")) return "infrastructure";
	if (category.includes("crowd")) return "overcrowding";
	if (category.includes("security")) return "security";
	if (category.includes("medical") || category.includes("fire")) return "medical";
	return "other";
};

export async function GET() {
	try {
		const db = await getDatabase();
		const complaints = await db
			.collection<ComplaintDoc>("complaints")
			.find({}, { projection: { complaintId: 1, pnr: 1, category: 1, description: 1, status: 1, priority: 1, createdAt: 1, resolvedAt: 1, train: 1, location: 1 } })
			.sort({ createdAt: -1 })
			.toArray();

		const mapped = complaints.map((item) => ({
			id: String(item.complaintId || ""),
			category: normalizeCategory(item.category),
			description: String(item.description || "No description provided."),
			location: {
				coordinates:
					typeof item.location?.latitude === "number" && typeof item.location?.longitude === "number"
						? {
								latitude: item.location.latitude,
								longitude: item.location.longitude,
							}
						: undefined,
				trainNumber: String(item.train?.number || ""),
				coachNumber: String(item.train?.coach || ""),
			},
			timestamp: toIsoDate(item.createdAt) || new Date().toISOString(),
			priority: normalizePriority(item.priority),
			status: normalizeStatus(item.status),
			passengerInfo: {
				name: "Passenger",
				phone: "",
				pnr: item.pnr ? String(item.pnr) : undefined,
			},
			resolvedAt: toIsoDate(item.resolvedAt),
		}));

		const stats = {
			total: mapped.length,
			pending: mapped.filter((item) => item.status === "pending").length,
			inProgress: mapped.filter((item) => item.status === "in-progress").length,
			resolved: mapped.filter((item) => item.status === "resolved").length,
			critical: mapped.filter((item) => item.priority === "critical" || item.priority === "high").length,
		};

		return NextResponse.json({ complaints: mapped, stats });
	} catch {
		return NextResponse.json({ error: "Unable to fetch admin complaints." }, { status: 500 });
	}
}
