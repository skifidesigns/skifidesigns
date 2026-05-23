import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export const FinalCTA = () => {
  const handleBookCall = () => {
    window.open('https://cal.com/skifi/30min', '_blank');
  };

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2A7AFE]/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Ready to Upgrade Your Presentation?
        </h2>
        <p className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
          Let's turn your ideas into presentations people remember.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleBookCall}
            size="lg"
            className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white px-10 py-7 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 group"
          >
            <Calendar className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
            Book a Discovery Call
          </Button>
          
          <Button
            onClick={() => window.open('https://www.fiverr.com/skifidesigns', '_blank')}
            size="lg"
            variant="outline"
            className="border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/40 px-10 py-7 text-lg font-medium rounded-xl transition-all duration-300 group"
          >
            Start Your Project
            <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
