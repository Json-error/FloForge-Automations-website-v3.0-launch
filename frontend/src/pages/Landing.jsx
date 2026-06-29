import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Toaster } from "@/components/ui/sonner";

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-[#0F172A] text-[#F8FAFC] antialiased">
      <Navbar />
      <Hero />
      <Toaster position="top-center" />
    </main>
  );
}
