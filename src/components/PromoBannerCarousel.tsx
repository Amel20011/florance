import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, Tag, Flame, ArrowRight } from 'lucide-react';
import bannerPulsa from '../assets/images/promo_pulsa_data_1789357142192.jpg';
import bannerTransfer from '../assets/images/promo_transfer_free_1789357157756.jpg';
import bannerGramedia from '../assets/images/promo_gramedia_read_1789357174096.jpg';

interface PromoBannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  imageUrl: string;
  actionCategory?: string;
  targetLinkText: string;
}

const BANNERS: PromoBannerItem[] = [
  {
    id: 'banner-pulsa-data',
    title: 'Pulsa & Data Murah Meriah',
    subtitle: 'Isi ulang kilat semua operator tanpa resah 24 jam nonstop',
    badge: 'PROMO KHUSUS',
    badgeColor: 'bg-amber-400 text-slate-900',
    imageUrl: bannerPulsa,
    actionCategory: 'pulsa',
    targetLinkText: 'Beli Pulsa Sekarang',
  },
  {
    id: 'banner-transfer-free',
    title: 'Gratis Biaya Transfer & Topup',
    subtitle: 'Kirim saldo ke semua e-wallet & rekening bank bebas admin',
    badge: 'HEMAT 100%',
    badgeColor: 'bg-emerald-500 text-white',
    imageUrl: bannerTransfer,
    actionCategory: 'token',
    targetLinkText: 'Lihat Layanan',
  },
  {
    id: 'banner-gramedia-buku',
    title: 'Teman Membaca & Edukasi Digital',
    subtitle: 'Diskon hingga 30% untuk voucher digital & platform belajar',
    badge: 'DISKON 30%',
    badgeColor: 'bg-rose-500 text-white',
    imageUrl: bannerGramedia,
    actionCategory: 'layanan',
    targetLinkText: 'Klaim Diskon',
  },
];

interface PromoBannerCarouselProps {
  onSelectCategory?: (category: string) => void;
}

export const PromoBannerCarousel: React.FC<PromoBannerCarouselProps> = ({
  onSelectCategory,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Next Slide Handler
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
  }, []);

  // Previous Slide Handler
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  }, []);

  // Auto slide every 3 seconds (3000ms)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Touch handlers for manual swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setDragStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX === null) {
      setIsPaused(false);
      return;
    }
    const endX = e.changedTouches[0].clientX;
    const diffX = dragStartX - endX;

    // Trigger swipe if threshold > 40px
    if (diffX > 40) {
      nextSlide();
    } else if (diffX < -40) {
      prevSlide();
    }

    setDragStartX(null);
    setIsPaused(false);
  };

  const currentBanner = BANNERS[currentIndex];

  const handleBannerClick = () => {
    if (currentBanner.actionCategory && onSelectCategory) {
      onSelectCategory(currentBanner.actionCategory);
    }
  };

  return (
    <div
      id="promo-banner-carousel"
      className="relative w-full rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-900 group select-none transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 16:9 or responsive aspect container */}
      <div className="relative w-full aspect-[16/8] sm:aspect-[21/9] md:aspect-[2.4/1] overflow-hidden bg-slate-950">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={handleBannerClick}
          >
            {/* Background Image */}
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent flex flex-col justify-end p-4 sm:p-6" />

            {/* Banner Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10 flex items-end justify-between gap-3">
              <div className="space-y-1 sm:space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-wide uppercase shadow-xs ${currentBanner.badgeColor}`}
                  >
                    {currentBanner.badge}
                  </span>
                  <span className="text-[11px] text-white/80 font-medium hidden sm:inline">
                    Update Otomatis 3s
                  </span>
                </div>
                <h3 className="text-sm sm:text-lg md:text-xl font-black text-white leading-tight drop-shadow-md">
                  {currentBanner.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-200 line-clamp-1 drop-shadow-sm">
                  {currentBanner.subtitle}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerClick();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold shadow-lg backdrop-blur-sm transition-all hover:scale-105 cursor-pointer shrink-0"
              >
                <span>{currentBanner.targetLinkText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Left & Right Edge Blur Overlays for Smooth Horizon Drag */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-black/40 to-transparent backdrop-blur-[1px]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-black/40 to-transparent backdrop-blur-[1px]" />

        {/* Navigation Arrows (Prev / Next) */}
        <button
          id="banner-prev-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md opacity-80 group-hover:opacity-100 transition-all cursor-pointer z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          id="banner-next-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md opacity-80 group-hover:opacity-100 transition-all cursor-pointer z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination Dots Indicator with Progress */}
        <div className="absolute bottom-2.5 sm:bottom-3 right-4 sm:right-6 z-20 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          {BANNERS.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-5 h-1.5 bg-blue-500'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
