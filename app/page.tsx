"use client";

import { useState } from "react";
import { ComplaintForm } from "@/components/complaint-form";
import { FeatureCards } from "@/components/feature-cards";
import { HowItWorks } from "@/components/how-it-works";
import { Train, ArrowRight, Github, Mail, Shield, FileText, Menu, X, UserCog, Building2, NotebookPen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleLoginItems = [
    { href: "/role-login/railway-staff", label: "Railway Staff Login", icon: UserCog },
    { href: "/role-login/rpf", label: "RPF Login", icon: Shield },
    { href: "/role-login/station-master", label: "Station Master Login", icon: Building2 },
    { href: "/role-login/register", label: "📝 Register", icon: NotebookPen },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="container relative mx-auto flex h-16 items-center px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle role login sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Train className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold text-foreground">Rail Madad AI</span>
              <span className="text-[10px] text-muted-foreground">Smart Railway Complaints</span>
            </div>
          </Link>

          <nav className="ml-auto hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground">
              Home
            </Link>
            <Link href="/submit" className="px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              Register Complaint
            </Link>
            <Link href="/track" className="px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              Track Status
            </Link>
            <Link href="/admin" className="px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              Admin Login
            </Link>
          </nav>
        </div>
      </header>

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 border-r border-slate-800 bg-[#111827] p-4 text-white shadow-xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/70">Role Logins</h3>
        <div className="space-y-2">
          {roleLoginItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 top-16 z-30 bg-black/40 lg:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className={sidebarOpen ? "lg:pl-72" : ""}>
      <main>
        {/* Hero Section with Glassmorphism */}
        <section className="relative overflow-hidden bg-primary py-20 sm:py-28">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
          </div>
          <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-[#134a6b]" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Glassmorphism Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 text-sm text-white mb-8">
                <Train className="h-4 w-4 text-accent" />
                <span>Rail Madad AI - Smart Railway Complaint System</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance leading-tight">
                AI-Powered Railway Complaint{" "}
                <span className="text-accent">Detection & Resolution</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto text-pretty">
                Upload an image. We detect the issue, location, and priority instantly.
                Making Indian Railways smarter, one complaint at a time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg" asChild>
                  <Link href="/submit">
                    Report Complaint
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
            </svg>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Powerful Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Our AI-powered platform ensures your complaints are handled efficiently and transparently
              </p>
            </div>
            <FeatureCards />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 sm:py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Simple 4-step process from complaint to resolution
              </p>
            </div>
            <HowItWorks />
          </div>
        </section>

        {/* Complaint Form Section */}
        <section id="submit" className="py-16 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Register Your Complaint
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Upload an image of the issue and let our AI assist in categorizing your complaint
              </p>
            </div>
            <ComplaintForm />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 sm:py-20 bg-primary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Trusted by Millions
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto text-lg">
                Real-time statistics from our complaint management system
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: "2.5M+", label: "Complaints Processed" },
                { value: "95%", label: "Accuracy" },
                { value: "< 4hrs", label: "Avg Resolution Time" },
                { value: "50K+", label: "Active Users" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Make Railways Smarter with AI
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join millions of passengers who trust Rail Madad for faster complaint resolution
              </p>
              <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg" asChild>
                <Link href="/submit">
                  Start Reporting
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Train className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="font-bold text-lg text-foreground">Rail Madad AI</span>
                  <p className="text-xs text-muted-foreground">Smart Railway Complaint System</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                AI-powered complaint management system for Indian Railways. 
                Faster resolution, better service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/track" className="text-muted-foreground hover:text-foreground transition-colors">Track Complaint</Link></li>
                <li><Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  railmadad@gov.in
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Helpline: 139
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Github className="h-4 w-4" />
                  GitHub
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Privacy Policy
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Indian Railways Grievance Redressal Portal
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
