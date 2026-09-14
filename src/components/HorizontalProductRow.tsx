import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types.js';
import { ProductCard } from './ProductCard.js';
import { useTheme } from '../context/ThemeContext.js';

interface HorizontalProductRowProps {
  products: Product[];
  onBuyNow: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

export const HorizontalProductRow: React.FC<HorizontalProductRowProps> = ({
  products,
  onBuyNow,
  onViewDetail,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // RGB for background vignette: Light slate-50 (248, 250, 252) vs Dark navy (9, 14, 31)
  const rgb = isDark ? '9, 14, 31' : '248, 250, 252';

  // Check scroll bounds to display / fade navigation buttons
  const checkScrollBounds = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScrollBounds();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollBounds, { passive: true });
      window.addEventListener('resize', checkScrollBounds, { passive: true });
      return () => {
        el.removeEventListener('scroll', checkScrollBounds);
        window.removeEventListener('resize', checkScrollBounds);
      };
    }
  }, [checkScrollBounds, products]);

  // Smooth button scroll by card width (~220px)
  const scrollBy = (offset: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: offset,
      behavior: 'smooth',
    });
  };

  // Mouse Drag to Scroll (Silky Desktop Experience)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative group/row -mx-4 px-4 sm:mx-0 sm:px-0 select-none">
      {/* Left Edge Seamless Gradient Blur Vignette */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 bottom-2.5 w-6 sm:w-12 z-10 transition-opacity duration-300 rounded-l-2xl ${
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(to right, rgba(${rgb}, 0.95) 0%, rgba(${rgb}, 0.6) 50%, rgba(${rgb}, 0) 100%)`,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          maskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
        }}
      />

      {/* Right Edge Seamless Gradient Blur Vignette */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute right-0 top-0 bottom-2.5 w-8 sm:w-16 z-10 transition-opacity duration-300 rounded-r-2xl ${
          canScrollRight ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(to left, rgba(${rgb}, 0.95) 0%, rgba(${rgb}, 0.6) 50%, rgba(${rgb}, 0) 100%)`,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          maskImage: 'linear-gradient(to left, black 35%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, black 35%, transparent 100%)',
        }}
      />

      {/* Left Navigation Arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-240)}
          aria-label="Geser ke kiri"
          className="absolute left-1 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm hidden sm:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(240)}
          aria-label="Geser ke kanan"
          className="absolute right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm hidden sm:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Horizontal Smooth Scroll Container with GPU acceleration */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 px-1 no-scrollbar scroll-smooth snap-x snap-mandatory overscroll-x-contain touch-pan-x ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab sm:cursor-default'
        }`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          transform: 'translateZ(0)',
          willChange: 'scroll-position',
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[180px] sm:w-[210px] md:w-[225px] shrink-0 snap-start flex transform-gpu"
          >
            <ProductCard
              product={product}
              onBuyNow={onBuyNow}
              onViewDetail={onViewDetail}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

