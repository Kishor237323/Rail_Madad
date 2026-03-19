import { Card, CardContent } from "@/components/ui/card";
import { Camera, Sparkles, MapPin, Clock, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Image-Based Complaints",
    description: "Upload photos of issues for accurate reporting and faster resolution",
  },
  {
    icon: Sparkles,
    title: "AI Classification",
    description: "Automatic categorization and priority assessment using advanced AI",
  },
  {
    icon: MapPin,
    title: "GPS Location",
    description: "Automatic location capture for precise issue identification",
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    description: "Track your complaint status from submission to resolution",
  },
  {
    icon: Shield,
    title: "Smart Routing",
    description: "Complaints routed to the right department automatically",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics for railway staff and administrators",
  },
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature) => (
        <Card key={feature.title} className="bg-card hover:bg-card/80 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
