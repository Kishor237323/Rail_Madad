"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Phone, Shield, Stethoscope, Flame } from "lucide-react";

const emergencyOptions = [
  {
    id: "security",
    icon: Shield,
    label: "Security Emergency",
    description: "Report theft, harassment, or suspicious activity",
    color: "text-destructive",
    bgColor: "bg-destructive/10 hover:bg-destructive/20",
  },
  {
    id: "medical",
    icon: Stethoscope,
    label: "Medical Emergency",
    description: "Request immediate medical assistance",
    color: "text-accent",
    bgColor: "bg-accent/10 hover:bg-accent/20",
  },
  {
    id: "fire",
    icon: Flame,
    label: "Fire Emergency",
    description: "Report fire or smoke in the train",
    color: "text-warning",
    bgColor: "bg-warning/10 hover:bg-warning/20",
  },
];

export function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);

  const handleEmergencySelect = (id: string) => {
    setSelectedEmergency(id);
    // In a real app, this would trigger an immediate alert to railway authorities
    setTimeout(() => {
      setSelectedEmergency(null);
    }, 3000);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        className="fixed bottom-6 right-6 z-50 h-14 px-6 shadow-lg gap-2"
        onClick={() => setIsOpen(true)}
      >
        <AlertTriangle className="h-5 w-5" />
        <span className="hidden sm:inline">Emergency</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Emergency Assistance
            </DialogTitle>
            <DialogDescription>
              Select the type of emergency. Help will be dispatched immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {emergencyOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleEmergencySelect(option.id)}
                disabled={selectedEmergency !== null}
                className={`w-full flex items-start gap-4 p-4 rounded-lg border border-border transition-colors ${option.bgColor} ${
                  selectedEmergency === option.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <option.icon className={`h-6 w-6 ${option.color} mt-0.5`} />
                <div className="text-left">
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </button>
            ))}
          </div>

          {selectedEmergency && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
              <p className="text-success font-medium">Emergency Alert Sent</p>
              <p className="text-sm text-muted-foreground">Railway authorities have been notified</p>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-2">Railway Helpline</p>
            <a
              href="tel:139"
              className="flex items-center gap-2 text-primary font-semibold text-lg hover:underline"
            >
              <Phone className="h-5 w-5" />
              139
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
