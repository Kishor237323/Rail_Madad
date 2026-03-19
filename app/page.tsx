import { Header } from "@/components/header";
import { ComplaintForm } from "@/components/complaint-form";
import { EmergencyButton } from "@/components/emergency-button";
import { FeatureCards } from "@/components/feature-cards";
import { Train, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-sidebar py-16 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-sidebar-accent px-4 py-1.5 text-sm text-sidebar-foreground mb-6">
                <Train className="h-4 w-4 text-sidebar-primary" />
                <span>AI-Powered Railway Grievance Redressal</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-sidebar-foreground mb-6 text-balance">
                Faster Resolution with{" "}
                <span className="text-sidebar-primary">Intelligent</span>{" "}
                Complaint Management
              </h1>
              
              <p className="text-lg text-sidebar-foreground/70 mb-8 max-w-2xl mx-auto text-pretty">
                Submit complaints with images, get automatic AI classification, and track resolution in real-time. 
                Making Indian Railways better, one complaint at a time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2" asChild>
                  <a href="#submit">
                    Submit Complaint
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80" asChild>
                  <Link href="/track">Track Status</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Why Choose Rail Madad
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform ensures your complaints are handled efficiently and transparently
              </p>
            </div>
            <FeatureCards />
          </div>
        </section>

        {/* Complaint Form Section */}
        <section id="submit" className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Submit Your Complaint
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Upload an image of the issue and let our AI assist in categorizing your complaint
              </p>
            </div>
            <ComplaintForm />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 bg-sidebar">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: "2.5M+", label: "Complaints Resolved" },
                { value: "95%", label: "Resolution Rate" },
                { value: "< 4hrs", label: "Avg Response Time" },
                { value: "98%", label: "AI Accuracy" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-sidebar-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-sidebar-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Train className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Rail Madad</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Indian Railways Grievance Redressal Portal
            </p>
            <p className="text-sm text-muted-foreground">
              Helpline: 139
            </p>
          </div>
        </div>
      </footer>

      <EmergencyButton />
    </div>
  );
}
