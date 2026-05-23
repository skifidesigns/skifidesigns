import React from "react";
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

const Home = () => {
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
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
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
