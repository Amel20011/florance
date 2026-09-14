import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formatter?: (val: number) => string;
  className?: string;
  enableBlur?: boolean;
  blurMax?: number;
  useIndonesianFormat?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1400,
  prefix = '',
  suffix = '',
  decimals = 0,
  formatter,
  className = '',
  enableBlur = true,
  blurMax = 3.5,
  useIndonesianFormat = true,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [blurAmount, setBlurAmount] = useState<number>(0);
  const prevValueRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = value;
    const diff = endVal - startVal;

    if (diff === 0) {
      setDisplayValue(endVal);
      setBlurAmount(0);
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easeOutExpo / easeOutCubic curve for realistic deceleration
      const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startVal + diff * easeOutProgress;

      setDisplayValue(current);

      if (enableBlur) {
        // Blur is highest during rapid motion (0.1 to 0.7 progress) and smoothly fades to 0
        const velocity = 1 - progress;
        const currentBlur = Math.sin(progress * Math.PI) * blurMax * velocity;
        setBlurAmount(Number(currentBlur.toFixed(2)));
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
        setBlurAmount(0);
        prevValueRef.current = endVal;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, enableBlur, blurMax]);

  const formatted = formatter
    ? formatter(displayValue)
    : decimals > 0
    ? displayValue.toLocaleString(useIndonesianFormat ? 'id-ID' : 'en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : Math.round(displayValue).toLocaleString(useIndonesianFormat ? 'id-ID' : 'en-US');

  return (
    <span
      className={`inline-block transition-[filter] will-change-[filter,transform] ${className}`}
      style={{
        filter: blurAmount > 0.05 ? `blur(${blurAmount}px)` : 'none',
        transform: blurAmount > 0.05 ? `translateY(${Math.sin(blurAmount) * -0.5}px)` : 'none',
      }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
