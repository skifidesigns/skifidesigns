import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { TrustedBy } from "./components/TrustedBy";
import { Services } from "./components/Services";
import { WhySkiFi } from "./components/WhySkiFi";
import { Portfolio } from "./components/Portfolio";
import { Process } from "./components/Process";
import { Pricing } from "./components/Pricing";
import { Testimonials } from "./components/Testimonials";
import { Founder } from "./components/Founder";
import { FAQ } from "./components/FAQ";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";
import { FloatingContact } from "./components/FloatingContact";
import { PaymentSuccess } from "./components/PaymentSuccess";
import { AdminPanel } from "./components/AdminPanel";
import { Resources } from "./components/Resources";
import { AuthCallback } from "./components/AuthCallback";
import { Blog } from "./components/Blog";
import { BlogPost } from "./components/BlogPost";
import { PrivacyPolicy, TermsOfService, RefundPolicy, CookiePolicy } from "./components/Legal";
import { ClientDashboard } from "./components/ClientDashboard";
import { CaseStudies } from "./components/CaseStudies";
import { CaseStudy } from "./components/CaseStudy";
import { trackPageview } from "./utils/analytics";

const Home = () => {
  const location = useLocation();

  // After navigating from another route to /#sectionId, scroll the section
  // into view (react-router does NOT do this automatically). Runs on every
  // hash change so it also works for second-time navigations like
  // /resources -> Pricing -> back to /resources -> Pricing.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    // Header is fixed-position; wait a frame so the layout is committed,
    // then scroll. requestAnimationFrame is more reliable than setTimeout(0).
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => clearTimeout(t);
  }, [location.hash, location.key]);

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <Hero />
      <TrustedBy />
      <div id="services">
        <Services />
      </div>
      <WhySkiFi />
      <div id="portfolio">
        <Portfolio />
      </div>
      <div id="process">
        <Process />
      </div>
      <Pricing />
      <div id="testimonials">
        <Testimonials />
      </div>
      <Founder />
      <div id="faq">
        <FAQ />
      </div>
      <FinalCTA />
      <Footer />
      <FloatingContact />
    </div>
  );
};

// Synchronous check for OAuth callback hash to prevent race conditions
const AppRouter = () => {
  const location = useLocation();

  // Fire a GA4 page_view on every SPA route change (and on first paint)
  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);

  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/resources/template/:id" element={<Resources />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/case-studies" element={<CaseStudies />} />
      <Route path="/case-studies/:slug" element={<CaseStudy />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/dashboard" element={<ClientDashboard />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App relative">
          <Toaster position="top-center" richColors />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
