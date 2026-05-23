import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';

export const Hero = () => {
  const { theme } = useTheme();
  
  const handleBookCall = () => {
    window.open('https://cal.com/skifi/30min', '_blank');
  };

  const handleViewPortfolio = () => {
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByZXNlbnRhdGlvbnxlbnwwfHx8fDE3Nzk1NTcwMjZ8MA&ixlib=rb-4.1.0&q=85"
          alt="Professional Business Presentation"
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-b from-black/80 via-black/70 to-black' : 'bg-gradient-to-b from-white/90 via-white/80 to-white'}`}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32 text-center">
        <div className="space-y-8 animate-fade-in">
          {/* Availability Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/10 backdrop-blur-lg rounded-full border border-border">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                Available for New Projects
              </span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
            Design Presentations That
            <span className="block mt-2 bg-gradient-to-r from-[#2A7AFE] to-[#3B82F6] bg-clip-text text-transparent">
              Actually Win Business
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Premium presentation design studio helping founders, agencies, and global brands communicate with clarity, confidence, and impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button
              onClick={handleBookCall}
              size="lg"
              className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white px-8 py-6 text-lg font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50 group"
            >
              <Calendar className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Book a Free Call
            </Button>
            
            <Button
              onClick={handleViewPortfolio}
              size="lg"
              variant="outline"
              className="border-2 border-border bg-card/50 backdrop-blur-sm text-foreground hover:bg-accent hover:border-[#2A7AFE]/40 px-8 py-6 text-lg font-medium rounded-lg transition-all duration-300 group"
            >
              View Portfolio
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">7+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">2,700+</div>
              <div className="text-sm text-muted-foreground">Slides Designed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Clients Worldwide</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-border rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-foreground rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};
