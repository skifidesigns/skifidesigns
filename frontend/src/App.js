import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/ThemeContext";
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

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
