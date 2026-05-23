import React from 'react';
import { Star } from 'lucide-react';
import { testimonials } from '../data/mock';
import { Card, CardContent } from './ui/card';

export const Testimonials = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-950">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            What Clients Say
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients have to say about working with us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-[#2A7AFE]/50 transition-all duration-300 hover:scale-105 group"
            >
              <CardContent className="p-8">
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#2A7AFE] text-[#2A7AFE]" />
                  ))}
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-white/10 pt-6">
                  <div className="font-bold text-white text-lg">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}, {testimonial.company}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
