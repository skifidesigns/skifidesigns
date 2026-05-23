import React from 'react';
import { processSteps } from '../data/mock';

export const Process = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Our Process
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A proven approach that transforms your ideas into presentation excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <div
              key={step.id}
              className="relative group h-full"
            >
              {index < processSteps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#2A7AFE] to-transparent transform translate-x-8"></div>
              )}
              
              <div className="relative p-8 bg-card backdrop-blur-sm border border-border rounded-2xl hover:bg-accent hover:border-[#2A7AFE]/50 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                <div className="text-6xl font-semibold text-transparent bg-gradient-to-br from-[#2A7AFE] to-[#3B82F6] bg-clip-text mb-6">
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
