import { NextResponse } from "next/server";
import { z } from "zod";

import { getDatabase } from "@/lib/server/db";

const registerComplaintSchema = z.object({
  complaintMode: z.enum(["train", "emergency"]),
  pnr: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional().default(""),
  imagePath: z.string().optional(),
  trainDetails: z
    .object({
      trainName: z.string().optional(),
      trainNumber: z.string().optional(),
      coach: z.string().optional(),
      seat: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .nullable()
    .optional(),
});

function generateComplaintId() {
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `RM${randomDigits}`;
}

function classifyTrainComplaint(description: string) {
  const text = description.toLowerCase();

  if (/toilet|dirty|clean|smell|garbage|waste/.test(text)) return "dirty_toilet";
  if (/light|switch|socket|fan|ac|electrical|power/.test(text)) return "light_not_working";
  if (/tap|water|leak|washbasin/.test(text)) return "tap_issue";
  if (/seat|berth|broken/.test(text)) return "seat_issue";

  return "floor_cleanliness";
}

function routeComplaint(category: string) {
  const normalized = category.toLowerCase();

  if (["security", "crowd"].includes(normalized)) {
    return ["RPF", "Railway Staff"];
  }

  if (["medical", "fire"].includes(normalized)) {
    return ["Railway Staff", "Station Master"];
  }

  return ["Railway Staff"];
}

function getRoleForTeam(team: string) {
  if (team === "RPF") return "rpf";
  if (team === "Station Master") return "station_master";
  return "railway_staff";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerComplaintSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid complaint payload." }, { status: 400 });
    }

    const data = parsed.data;
    const db = await getDatabase();

    const coach = data.trainDetails?.coach?.trim().toUpperCase();
    const trainNumber = data.trainDetails?.trainNumber?.trim();
    const incidentStation = (data.trainDetails?.from || "").trim();

    const complaintId = generateComplaintId();
    const normalizedEmergencyCategory = (data.category || "").trim();

    if (data.complaintMode === "emergency") {
      const allowedEmergencyCategories = ["Medical", "Fire", "Security", "Crowd"];
      if (!allowedEmergencyCategories.includes(normalizedEmergencyCategory)) {
        return NextResponse.json({ error: "Invalid emergency category." }, { status: 400 });
      }
    }

    const internalCategory =
      data.complaintMode === "train"
        ? classifyTrainComplaint(data.description || "")
        : normalizedEmergencyCategory;

    const isEmergencyCategory = /medical|fire|security|crowd/i.test(internalCategory);
    const assignedUsernames = new Set<string>();
    let assignedTo = routeComplaint(internalCategory);
    let assignedStaffUsername: string | null = null;

    // Train complaint routing: assign to the staff mapped to train_number
    if (assignedTo.length === 1 && assignedTo[0] === "Railway Staff") {
      const trainStaff = trainNumber
        ? await db
            .collection<{ username: string }>("users")
            .findOne({ role: "railway_staff", train_number: trainNumber })
        : null;

      if (trainStaff?.username) {
        assignedTo = [trainStaff.username];
        assignedStaffUsername = trainStaff.username;
        assignedUsernames.add(trainStaff.username);
      }
    }

    for (const target of assignedTo) {
      // If direct username assignment, add as-is
      if (!["RPF", "Railway Staff", "Station Master"].includes(target)) {
        assignedUsernames.add(target);
        continue;
      }

      const role = getRoleForTeam(target);

      if (role === "rpf") {
        const rpfUsers = await db
          .collection<{ username: string }>("users")
          .find(incidentStation ? { role, station: incidentStation } : { role })
          .toArray();

        (rpfUsers.length ? rpfUsers : await db.collection<{ username: string }>("users").find({ role }).toArray()).forEach(
          (user) => assignedUsernames.add(user.username)
        );
        continue;
      }

      if (role === "station_master") {
        const stationUsers = await db
          .collection<{ username: string }>("users")
          .find(incidentStation ? { role, station: incidentStation } : { role })
          .toArray();

        (stationUsers.length
          ? stationUsers
          : await db.collection<{ username: string }>("users").find({ role }).toArray()
        ).forEach((user) => assignedUsernames.add(user.username));
        continue;
      }

      // Railway Staff team assignment for emergency/security routes: target by train number when available
      const staffUsers = await db
        .collection<{ username: string }>("users")
        .find(trainNumber ? { role, train_number: trainNumber } : { role })
        .toArray();

      if (staffUsers.length) {
        staffUsers.forEach((user) => assignedUsernames.add(user.username));
        if (!assignedStaffUsername) {
          assignedStaffUsername = staffUsers[0].username;
        }
      } else {
        const fallbackStaff = await db.collection<{ username: string }>("users").find({ role }).toArray();
        fallbackStaff.forEach((user) => assignedUsernames.add(user.username));
      }
    }

    await db.collection("complaints").insertOne({
      complaintId,
      complaintMode: data.complaintMode,
      pnr: data.pnr,
      category: internalCategory,
      description: data.description || "",
      imagePath: data.imagePath || null,
      imageUploadedAt: data.imagePath ? new Date() : null,
      train: {
        name: data.trainDetails?.trainName || "",
        number: data.trainDetails?.trainNumber || "",
        coach: coach || "",
        seat: data.trainDetails?.seat || "",
        from: data.trainDetails?.from || "",
        to: data.trainDetails?.to || "",
      },
      location: data.location || null,
      status: "pending",
      priority: isEmergencyCategory || data.complaintMode === "emergency" ? "high" : "normal",
      assignedTo,
      assignedUsernames: Array.from(assignedUsernames),
      assignedStaffUsername,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
    });

    return NextResponse.json({
      success: true,
      complaintId,
      assignedTo,
      assignedUsernames: Array.from(assignedUsernames),
      assignedStaffUsername,
    });
  } catch {
    return NextResponse.json({ error: "Unable to register complaint." }, { status: 500 });
  }
}
