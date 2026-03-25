import { Header } from "@/components/header";
import { ComplaintForm } from "@/components/complaint-form";

export default function SubmitComplaintPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-10 sm:py-14">
        <section className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Register Complaint</h1>
            <p className="mt-2 text-muted-foreground">
              Register your railway complaint with OTP verification, complaint category, and location support.
            </p>
          </div>

          <ComplaintForm />
        </section>
      </main>
    </div>
  );
}
