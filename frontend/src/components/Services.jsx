import React from 'react';
import { Presentation, Briefcase, TrendingUp, Video, BarChart, Layers } from 'lucide-react';
import { services } from '../data/mock';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const iconMap = {
  presentation: Presentation,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  video: Video,
  'bar-chart': BarChart,
  layers: Layers
};

export const Services = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-950">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            What We Design
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From pitch decks to corporate presentations, we create visuals that make your message memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <Card
                key={service.id}
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-[#2A7AFE]/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#2A7AFE]/20 group cursor-pointer"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2A7AFE] to-[#3B82F6] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">{service.title}</CardTitle>
                  <CardDescription className="text-gray-400 text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
