import React, { useState } from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';
import { OnboardingWizard } from './OnboardingWizard';

export const Hero = () => {
  const { theme } = useTheme();
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleBookCall = () => {
    window.open('https://cal.com/skifi/30min', '_blank');
  };

  const handleStartProject = () => {
    setWizardOpen(true);
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
            <span className="block mt-2 text-gradient-animated">
              Actually Win Business
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Premium presentation design agency specialising in investor pitch decks, sales decks and PowerPoint design for founders, agencies, and global brands.
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
              onClick={handleStartProject}
              size="lg"
              variant="outline"
              className="border-2 border-border bg-card/50 backdrop-blur-sm text-foreground hover:bg-accent hover:border-[#2A7AFE]/40 px-8 py-6 text-lg font-medium rounded-lg transition-all duration-300 group"
              data-testid="hero-start-project-btn"
            >
              <Sparkles className="w-5 h-5 mr-2 text-[#2A7AFE] group-hover:rotate-12 transition-transform" />
              Start a Project
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">7+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">2,700+</div>
              <div className="text-sm text-muted-foreground">Presentations Designed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">43+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">150+</div>
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

      <OnboardingWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialPlan="per_slide"
      />
    </section>
  );
};
