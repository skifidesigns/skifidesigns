import React from 'react';
import { ExternalLink, Phone } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaBehance, FaPinterestP } from 'react-icons/fa';
import { SiFiverr } from 'react-icons/si';
import { useTheme } from '../context/ThemeContext';

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/skifidesigns/', Icon: FaInstagram },
  { label: 'Facebook', href: 'https://www.facebook.com/skifidesigns/', Icon: FaFacebookF },
  { label: 'LinkedIn', href: 'https://in.linkedin.com/company/skifi', Icon: FaLinkedinIn },
  { label: 'Behance', href: 'https://www.behance.net/skifidesigns', Icon: FaBehance },
  { label: 'Pinterest', href: 'https://in.pinterest.com/skifidesigns/', Icon: FaPinterestP },
  { label: 'Fiverr', href: 'https://www.fiverr.com/skifidesigns', Icon: SiFiverr },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer className="relative bg-background border-t border-border overflow-hidden">
      <div className="skifi-mesh skifi-mesh-soft" style={{ opacity: 0.4 }} />
      <div className="absolute inset-0 skifi-grain pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10">
          <div>
            <img
              src={theme === 'dark' 
                ? "https://customer-assets.emergentagent.com/job_4d8ff9b3-24bd-4129-8ede-3c7cee7e66af/artifacts/hrib62cx_logo-b.svg"
                : "https://customer-assets.emergentagent.com/job_presentation-studio-22/artifacts/xoisqdyd_logo.svg"
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
                href="/resources"
                className="flex items-center gap-2 text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200"
              >
                Free Templates
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="/blog"
                className="flex items-center gap-2 text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200"
              >
                Blog
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
            <h3 className="text-foreground font-semibold mb-4 text-lg">Legal</h3>
            <div className="space-y-3">
              <a href="/privacy" className="block text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200" data-testid="footer-privacy">Privacy Policy</a>
              <a href="/terms" className="block text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200" data-testid="footer-terms">Terms of Service</a>
              <a href="/refund-policy" className="block text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200" data-testid="footer-refund">Refund Policy</a>
              <a href="/cookies" className="block text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200" data-testid="footer-cookies">Cookie Policy</a>
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
                data-testid="footer-whatsapp"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>

              {/* Social links */}
              <div className="flex flex-wrap gap-2 pt-1" data-testid="footer-socials">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    data-testid={`footer-social-${label.toLowerCase()}`}
                    className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-border bg-card/40 text-muted-foreground hover:text-white hover:bg-[#2A7AFE] hover:border-[#2A7AFE] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

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
                href="/blog"
                className="text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200 text-sm"
              >
                Blog
              </a>
              <a
                href="/resources"
                className="text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200 text-sm"
              >
                Resources
              </a>
              <a
                href="https://cal.com/skifi/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#2A7AFE] transition-colors duration-200 text-sm"
              >
                Book a Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
