"use client";

import { Upload, Brain, MapPin, Send, CheckCircle2 } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: Upload,
    title: "Upload Image",
    description: "Take a photo or upload an image of the issue you want to report",
  },
  {
    step: 2,
    icon: Brain,
    title: "AI Detects Issue",
    description: "Our AI model analyzes the image and classifies the complaint category",
  },
  {
    step: 3,
    icon: MapPin,
    title: "Location Captured",
    description: "GPS coordinates and timestamp are automatically captured for accuracy",
  },
  {
    step: 4,
    icon: Send,
    title: "Auto Routed",
    description: "Complaint is automatically routed to the appropriate department",
  },
];

export function HowItWorks() {
  return (
    <div className="relative">
      {/* Connection Line - Desktop */}
      <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-border" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={step.step} className="relative flex flex-col items-center text-center">
            {/* Step Number Circle */}
            <div className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full bg-card border-2 border-primary shadow-lg mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white mb-2">
                <step.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Step {step.step}</span>
            </div>
            
            {/* Arrow for mobile/tablet */}
            {index < steps.length - 1 && (
              <div className="lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
            )}
            
            <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
