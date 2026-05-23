import React from 'react';
import { ExternalLink, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Brand */}
          <div>
            <img
              src="https://customer-assets.emergentagent.com/job_4d8ff9b3-24bd-4129-8ede-3c7cee7e66af/artifacts/hrib62cx_logo-b.svg"
              alt="SkiFi Designs"
              className="h-10 w-auto mb-4"
            />
            <p className="text-gray-400 leading-relaxed">
              Premium presentation design studio helping brands communicate with clarity, confidence, and impact.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Quick Links</h3>
            <div className="space-y-3">
              <a
                href="https://www.behance.net/skifidesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-[#2A7AFE] transition-colors duration-200"
              >
                Portfolio on Behance
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://www.fiverr.com/skifidesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-[#2A7AFE] transition-colors duration-200"
              >
                Order on Fiverr
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://cal.com/skifi/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-[#2A7AFE] transition-colors duration-200"
              >
                Book a Meeting
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Contact</h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/+917827087878"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-[#2A7AFE] transition-colors duration-200"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                Available for Freelance & Fulltime
              </div>
              <p className="text-gray-400 text-sm">
                New Delhi, India
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} SkiFi Designs. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="https://www.linkedin.com/in/skifidesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#2A7AFE] transition-colors duration-200 text-sm"
              >
                LinkedIn
              </a>
              <a
                href="https://www.behance.net/skifidesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#2A7AFE] transition-colors duration-200 text-sm"
              >
                Behance
              </a>
              <a
                href="http://www.skifidesigns.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#2A7AFE] transition-colors duration-200 text-sm"
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
