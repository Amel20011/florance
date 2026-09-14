import React from 'react';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
  tooltipText?: string;
  variant?: 'gold' | 'blue';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  className = '',
  showTooltip = true,
  tooltipText = 'Akun Terverifikasi Resmi Florance (Gold Verified)',
  variant = 'gold',
}) => {
  const sizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const gradientId = variant === 'gold' ? 'official-gold-grad' : 'official-blue-grad';

  return (
    <span
      id="florance-official-verified-badge"
      title={showTooltip ? tooltipText : undefined}
      className={`inline-flex items-center justify-center shrink-0 select-none align-middle ${className}`}
    >
      <svg
        className={`${sizeMap[size]} shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Verified Badge"
      >
        <defs>
          {variant === 'gold' ? (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          ) : (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          )}
        </defs>

        {/* 
          Standard Universal 8-Lobed Symmetrical Scalloped Rosette
          (Bentuk resmi universal seperti X / Twitter Gold Verified & Instagram Verified)
        */}
        <path
          d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.67-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
          fill={`url(#${gradientId})`}
        />

        {/* 
          Clean Perfectly-Centered Rounded White Checkmark
        */}
        <path
          d="M7.75 12.25L10.25 14.75L16.25 8.75"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};
