import React from 'react';
import { motion } from 'framer-motion';
import { faqs } from '../data/mock';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export const FAQ = () => {
  return (
    <section id="faq" className="relative py-24 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Frequently asked <span className="skifi-gradient-text">questions</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about working with us.
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
            >              <AccordionItem
                value={`item-${faq.id}`}
                className="skifi-glass rounded-xl px-6 border border-border/60 hover:border-[#2A7AFE]/40 transition-colors"
              >
                <AccordionTrigger className="text-base font-medium text-foreground hover:text-[#2A7AFE] py-5 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[15px] leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
