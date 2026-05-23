import React from 'react';

/**
 * Soft animated color orbs that drift across the page — adds the glass/morph ambient
 * glow feel without competing with content. Renders fixed behind everything.
 */
export const AmbientOrbs = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Top-left blue orb */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-25 blur-[120px] animate-orb-1"
        style={{
          background: 'radial-gradient(circle at center, #2A7AFE 0%, transparent 70%)',
        }}
      />
      {/* Bottom-right blue-purple orb */}
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-25 dark:opacity-20 blur-[140px] animate-orb-2"
        style={{
          background: 'radial-gradient(circle at center, #3B82F6 0%, transparent 70%)',
        }}
      />
      {/* Mid-page floating accent */}
      <div
        className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full opacity-15 dark:opacity-15 blur-[100px] animate-orb-3"
        style={{
          background: 'radial-gradient(circle at center, #2A7AFE 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
