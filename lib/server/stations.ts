import { readFile } from "fs/promises";
import path from "path";

export type StationRecord = {
  name: string;
  latitude: number;
  longitude: number;
};

const stationsCsvPath = path.join(process.cwd(), "data", "stations.csv");

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function normalizeStationName(name: string) {
  return name
    .toLowerCase()
    .replace(/[().,]/g, " ")
    .replace(/\b(junction|jn|jnc|halt|station|road|rs|railway)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getStations() {
  const csv = await readFile(stationsCsvPath, "utf8");
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [] as StationRecord[];

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const nameIndex = headers.findIndex((header) => ["name", "station", "station_name"].includes(header));
  const latIndex = headers.findIndex((header) => ["lat", "latitude"].includes(header));
  const lonIndex = headers.findIndex((header) => ["lon", "lng", "longitude"].includes(header));

  return lines.slice(1).flatMap((line) => {
    const values = parseCsvLine(line);

    const name =
      nameIndex >= 0 && values[nameIndex]
        ? values[nameIndex]
        : values[0] ?? "";

    const latValue =
      latIndex >= 0 && values[latIndex]
        ? values[latIndex]
        : values.length >= 3
          ? values[1]
          : undefined;

    const lonValue =
      lonIndex >= 0 && values[lonIndex]
        ? values[lonIndex]
        : values.length >= 3
          ? values[2]
          : undefined;

    const latitude = Number(latValue);
    const longitude = Number(lonValue);

    if (!name || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return [];
    }

    return [{ name, latitude, longitude } satisfies StationRecord];
  });
}

export async function findNearestStation(latitude: number, longitude: number) {
  const stations = await getStations();
  if (!stations.length) return null;

  let nearest = stations[0];
  let bestDistance = haversineKm(latitude, longitude, nearest.latitude, nearest.longitude);

  for (const station of stations.slice(1)) {
    const distance = haversineKm(latitude, longitude, station.latitude, station.longitude);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = station;
    }
  }

  return {
    ...nearest,
    distanceKm: Number(bestDistance.toFixed(2)),
  };
}

export function findNearestStationFromNames(
  stationNames: string[],
  latitude: number,
  longitude: number,
  stations: StationRecord[]
) {
  const stationMap = new Map<string, StationRecord[]>();

  for (const station of stations) {
    const key = normalizeStationName(station.name);
    if (!key) continue;
    const list = stationMap.get(key) ?? [];
    list.push(station);
    stationMap.set(key, list);
  }

  const availableStations: StationRecord[] = [];
  const seen = new Set<string>();

  for (const stationName of stationNames) {
    const key = normalizeStationName(stationName);
    if (!key) continue;

    const matches = stationMap.get(key) ?? [];
    for (const station of matches) {
      const uniqueKey = `${station.name}|${station.latitude}|${station.longitude}`;
      if (seen.has(uniqueKey)) continue;
      seen.add(uniqueKey);
      availableStations.push(station);
    }
  }

  if (!availableStations.length) return null;

  let nearest = availableStations[0];
  let bestDistance = haversineKm(latitude, longitude, nearest.latitude, nearest.longitude);

  for (const station of availableStations.slice(1)) {
    const distance = haversineKm(latitude, longitude, station.latitude, station.longitude);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = station;
    }
  }

  return {
    ...nearest,
    distanceKm: Number(bestDistance.toFixed(2)),
  };
}
