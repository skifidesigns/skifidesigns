import React from 'react';
import { Phone } from 'lucide-react';

export const FloatingContact = () => {
  const phoneNumber = '+917827087878';
  const whatsappMessage = encodeURIComponent(
    "Hi SkiFi Team, I'd like to get a FREE Pitchdeck Review."
  );

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-stretch shadow-2xl rounded-full bg-white border border-gray-200 overflow-hidden"
      data-testid="floating-contact"
    >
      {/* WhatsApp side */}
      <a
        href={`https://wa.me/${phoneNumber.replace('+', '')}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="floating-whatsapp"
        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
      >
        {/* WhatsApp icon (inline SVG) */}
        <span className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-30 animate-ping"></span>
          <svg
            viewBox="0 0 32 32"
            className="w-7 h-7 relative"
            aria-hidden="true"
          >
            <path
              fill="#25D366"
              d="M16.001 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.59 4.46 1.72 6.41L3.2 28.8l6.55-1.72c1.88 1.03 4 1.58 6.25 1.58 7.07 0 12.8-5.73 12.8-12.8s-5.73-12.66-12.8-12.66z"
            />
            <path
              fill="#FFFFFF"
              d="M22.79 19.62c-.32-.16-1.9-.94-2.19-1.04-.29-.11-.5-.16-.71.16-.21.32-.81 1.04-.99 1.25-.18.21-.36.24-.68.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.36.48-.54.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55-.18-.01-.4-.01-.61-.01-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.25 3.44 5.45 4.83.76.33 1.36.53 1.82.68.76.24 1.46.21 2.01.13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37z"
            />
          </svg>
        </span>
        <span className="text-sm font-semibold text-gray-900 group-hover:text-green-700 whitespace-nowrap hidden sm:block">
          Get a FREE Pitchdeck Review
        </span>
        <span className="text-sm font-semibold text-gray-900 sm:hidden">WhatsApp</span>
      </a>

      {/* Divider */}
      <div className="w-px bg-gray-200"></div>

      {/* Call side */}
      <a
        href={`tel:${phoneNumber}`}
        data-testid="floating-call"
        aria-label="Call us"
        className="flex items-center justify-center px-5 py-3 hover:bg-gray-50 transition-colors"
      >
        <Phone className="w-6 h-6 text-gray-900" strokeWidth={2.2} />
      </a>
    </div>
  );
};
