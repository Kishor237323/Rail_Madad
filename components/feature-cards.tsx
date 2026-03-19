"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Camera, Sparkles, MapPin, Brain, Map, ScanText } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Image-Based Submission",
    description: "Upload photos of issues for accurate reporting and faster resolution",
  },
  {
    icon: Sparkles,
    title: "AI Classification",
    description: "ViT-powered image analysis automatically categorizes complaints",
  },
  {
    icon: MapPin,
    title: "Auto GPS Capture",
    description: "Automatic location and timestamp capture for precise issue identification",
  },
  {
    icon: Brain,
    title: "Smart Prioritization",
    description: "AI-driven priority assessment ensures critical issues get immediate attention",
  },
  {
    icon: Map,
    title: "Live Complaint Map",
    description: "Interactive map view showing real-time complaint locations and status",
  },
  {
    icon: ScanText,
    title: "OCR Text Extraction",
    description: "Automatic text extraction from images for additional context",
  },
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <Card 
          key={feature.title} 
          className="bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border"
        >
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
