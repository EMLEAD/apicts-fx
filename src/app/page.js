import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import Hero from "@/Components/Hero";
import Features from "@/Components/Features";
import Services from "@/Components/Services";
import HowItWorks from "@/Components/HowItWorks";
import BlogSection from "@/Components/BlogSection";
import CtaSection from "@/Components/CtaSection";
// import Login from "@/Components/Login";

export default function Home() {
  return (
    <div className="font-sans">
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Services Section */}
      <Services />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Blog Section */}
      <BlogSection />

      {/* CTA Section */}
      <CtaSection />
    
      {/* Footer */}
      <Footer />
    </div>
  );
}
