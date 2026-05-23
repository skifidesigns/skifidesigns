import React from 'react';
import { ExternalLink, Phone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div>
            <img
              src={theme === 'dark' 
                ? "https://customer-assets.emergentagent.com/job_4d8ff9b3-24bd-4129-8ede-3c7cee7e66af/artifacts/hrib62cx_logo-b.svg"
                : "https://customer-assets.emergentagent.com/job_presentation-studio-22/artifacts/rl617jri_logo%20clr.svg"
              }
              alt="SkiFi Designs"
              className="h-8 w-auto mb-4"
            />
            <p className="text-muted-foreground leading-relaxed">
              Premium presentation design studio helping brands communicate with clarity, confidence, and impact.
            </p>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4 text-lg">Quick Links</h3>
            <div className="space-y-3">
              <a
                href="https://www.behance.net/skifidesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200"
              >
                Portfolio on Behance
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://www.fiverr.com/skifidesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200"
              >
                Order on Fiverr
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://cal.com/skifi/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200"
              >
                Book a Meeting
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4 text-lg">Contact</h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/+917827087878"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
              <div className="pt-2">
                <p className="text-foreground font-semibold text-sm mb-1">
                  SKIFI GROUP LLC
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  30 N Gould St Ste R, Sheridan, WY 82801<br />
                  United States
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {currentYear} SkiFi Designs. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="https://www.linkedin.com/in/skifidesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200 text-sm"
              >
                LinkedIn
              </a>
              <a
                href="https://www.behance.net/skifidesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200 text-sm"
              >
                Behance
              </a>
              <a
                href="http://www.skifidesigns.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200 text-sm"
              >
                Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
