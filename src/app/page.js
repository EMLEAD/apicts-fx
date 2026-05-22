import Navbar from "@/Components/NavBar";
import Footer from "@/Components/Footer";
import Hero from "@/Components/Hero";
import Features from "@/Components/Features";
import Services from "@/Components/Services";
import HowItWorks from "@/Components/HowItWorks";
import BlogSection from "@/Components/BlogSection";
import ProductsSection from "@/Components/ProductsSection";
import AffiliateAdverts from "@/Components/AffiliateAdverts";
import CtaSection from "@/Components/CtaSection";
// import PlanList from "@/Components/PlanList";
// import Login from "@/Components/Login";
import TrustBadges from "@/Components/TrustBadges";

export default function Home() {
  return (
    <div className="font-sans">
      <Navbar />

      {/* Hero Section */}
      <Hero />

      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-0 md:px-4 max-w-[90rem] flex flex-col lg:flex-row items-start">
          
          <div className="flex-1 w-full min-w-0">
            {/* Features Section */}
            <Features />
            {/* Products Section */}
            <ProductsSection />
          </div>
          
          {/* Adverts Sidebar */}
          <div className="w-full lg:w-[350px] shrink-0 lg:sticky lg:top-24 pt-10 lg:pt-28 pb-20 px-6 lg:px-4 order-last border-t lg:border-t-0 lg:border-l border-gray-200 bg-white lg:bg-transparent">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 lg:text-left text-center">Affiliate Partners</h3>
            <AffiliateAdverts />
          </div>

        </div>
      </div>

      {/* Services Section */}
      {/* <Services /> */}

      {/* How It Works Section */}
      {/* <HowItWorks /> */}

   

      {/* Blog Section */}
      <BlogSection />
      {/* Trust Badges */}
      <TrustBadges />

      {/* CTA Section */}
      <CtaSection />
    
      {/* Footer */}
      <Footer />
    </div>
  );
}
