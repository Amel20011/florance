import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext.js';

export const ScrollBlurOverlay: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      setScrollY(currentScrollY);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Theme-aware RGB components:
  // Light: 248, 250, 252 (slate-50)
  // Dark: 9, 14, 31 (deep slate-950)
  const rgb = isDark ? '9, 14, 31' : '248, 250, 252';

  return (
    <>
      {/* 
        Unified Top Progressive Glass Blur (Header + Scroll Dissolve as ONE single element)
        Blends 100% seamlessly according to active theme.
      */}
      <div
        id="unified-top-scroll-blur"
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 right-0 z-35 h-20 sm:h-24 select-none transition-all duration-300"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0) 100%)',
          background: `linear-gradient(to bottom, rgba(${rgb}, 0.96) 0%, rgba(${rgb}, 0.88) 55%, rgba(${rgb}, 0.4) 80%, rgba(${rgb}, 0) 100%)`,
        }}
      />

      {/* 
        Unified Bottom Progressive Glass Blur (Bottom Navigation + Scroll Dissolve as ONE single element)
        Blends 100% seamlessly according to active theme.
      */}
      <div
        id="unified-bottom-scroll-blur"
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-35 h-20 sm:h-24 select-none transition-all duration-300"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          maskImage:
            'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)',
          background: `linear-gradient(to top, rgba(${rgb}, 0.98) 0%, rgba(${rgb}, 0.9) 45%, rgba(${rgb}, 0.4) 75%, rgba(${rgb}, 0) 100%)`,
        }}
      />
    </>
  );
};

