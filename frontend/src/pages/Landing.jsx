import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LoadingScreen from "@/components/LoadingScreen";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Industries from "@/components/Industries";
import AutomationEngine from "@/components/AutomationEngine";
import WhyFloForge from "@/components/WhyFloForge";
import Results from "@/components/Results";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-[#0F172A] text-[#F8FAFC] antialiased">
      <LoadingScreen />
      <Navbar />
      <Hero />
      <Services />
      <HowItWorks />
      <Industries />
      <AutomationEngine />
      <WhyFloForge />
      <Results />
      <Contact />
      <Footer />
      <Toaster position="top-center" />
    </main>
  );
}
