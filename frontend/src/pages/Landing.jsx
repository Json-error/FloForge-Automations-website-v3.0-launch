import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Industries from "@/components/Industries";
import WhyFloForge from "@/components/WhyFloForge";
import Results from "@/components/Results";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased">
      <Navbar />
      <Hero />
      <Services />
      <HowItWorks />
      <Industries />
      <WhyFloForge />
      <Results />
      <Contact />
      <Footer />
      <Toaster position="top-center" />
    </main>
  );
}
