import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 65; // Pull distance in px to trigger refresh
const MAX_PULL = 95; // Max visual displacement

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Check if page is at the very top
  const isAtTop = () => {
    return window.scrollY <= 1 || document.documentElement.scrollTop <= 1;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    if (isAtTop()) {
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
    } else {
      startYRef.current = null;
      isDraggingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || startYRef.current === null || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && isAtTop()) {
      // Damped pull effect (logarithmic / damping feel)
      const dampedDistance = Math.min(diff * 0.45, MAX_PULL);
      setPullDistance(dampedDistance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current || isRefreshing) return;
    isDraggingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(55); // Hold at comfortable height while spinning

      try {
        await Promise.all([
          onRefresh(),
          new Promise((resolve) => setTimeout(resolve, 800)), // Minimum pleasant spin duration
        ]);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsRefreshing(false);
          setPullDistance(0);
        }, 600);
      } catch (err) {
        console.error('Refresh error:', err);
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    startYRef.current = null;
  };

  // Rotation based on pull progress (0 to 360 deg)
  const rotation = Math.min((pullDistance / PULL_THRESHOLD) * 360, 360);
  const progressRatio = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div
      className="relative w-full min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator Spinner / Badge at Top Center */}
      <AnimatePresence>
        {(pullDistance > 10 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: 1,
              y: pullDistance - 15,
              scale: isRefreshing ? 1 : 0.8 + progressRatio * 0.2,
            }}
            exit={{ opacity: 0, y: -30, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed top-4 inset-x-0 mx-auto z-[999] w-max flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md pointer-events-none text-slate-800"
          >
            {showSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-200" />
                <span className="text-xs font-bold text-slate-900">
                  Data & Halaman Diperbarui
                </span>
              </>
            ) : (
              <>
                <div
                  className="flex items-center justify-center"
                  style={{
                    transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
                    transition: isRefreshing ? 'none' : 'transform 0.1s linear',
                  }}
                >
                  <RefreshCw
                    className={`w-4 h-4 text-blue-600 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {isRefreshing
                    ? 'Menyegarkan Sistem & Halaman...'
                    : pullDistance >= PULL_THRESHOLD
                    ? 'Lepaskan untuk Refresh'
                    : 'Tarik ke bawah untuk Refresh'}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with subtle pull translation */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.35}px)` : 'none',
          transition: isDraggingRef.current ? 'none' : 'transform 0.3s ease-out',
        }}
        className="w-full"
      >
        {children}
      </div>
    </div>
  );
};
