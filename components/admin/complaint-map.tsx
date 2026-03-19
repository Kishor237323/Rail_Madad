"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Complaint } from "@/lib/types";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const priorityColors: Record<string, string> = {
  critical: "#dc2626",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#22c55e",
};

interface ComplaintMapProps {
  complaints: Complaint[];
}

export function ComplaintMap({ complaints }: ComplaintMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on India
    mapRef.current = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    // Add markers for complaints with locations
    complaints.forEach((complaint) => {
      if (complaint.location?.coordinates) {
        const { latitude, longitude } = complaint.location.coordinates;
        
        // Create custom colored marker
        const markerColor = priorityColors[complaint.priority] || "#0B3C5D";
        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              background-color: ${markerColor};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapRef.current!);
        
        marker.bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 4px; color: #0B3C5D;">${complaint.id}</h3>
            <p style="color: #64748b; font-size: 12px; margin-bottom: 8px;">${complaint.category}</p>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <span style="
                background: ${priorityColors[complaint.priority]}; 
                color: white; 
                padding: 2px 8px; 
                border-radius: 9999px; 
                font-size: 11px;
                text-transform: capitalize;
              ">${complaint.priority}</span>
              <span style="
                background: ${complaint.status === 'resolved' ? '#22c55e' : '#f59e0b'}; 
                color: white; 
                padding: 2px 8px; 
                border-radius: 9999px; 
                font-size: 11px;
                text-transform: capitalize;
              ">${complaint.status}</span>
            </div>
            <p style="font-size: 12px; color: #334155;">${complaint.description.substring(0, 100)}...</p>
            ${complaint.trainNumber ? `<p style="font-size: 11px; color: #64748b; margin-top: 4px;">Train: ${complaint.trainNumber}</p>` : ''}
          </div>
        `);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [complaints]);

  return (
    <div 
      ref={mapContainerRef} 
      className="h-full w-full"
      style={{ minHeight: "400px" }}
    />
  );
}
