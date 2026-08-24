import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textVariant?: 'full' | 'short' | 'minimal';
  theme?: 'dark' | 'light' | 'white';
  className?: string;
  isWatermark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  textVariant = 'full',
  theme = 'dark',
  className = '',
  isWatermark = false,
}) => {
  const sizeMap = {
    sm: { icon: 32, textTitle: 'text-sm', textSub: 'text-[10px]' },
    md: { icon: 44, textTitle: 'text-base', textSub: 'text-xs' },
    lg: { icon: 60, textTitle: 'text-xl', textSub: 'text-sm' },
    xl: { icon: 84, textTitle: 'text-2xl', textSub: 'text-base' },
  };

  const { icon } = sizeMap[size];

  if (isWatermark) {
    return (
      <div className={`pointer-events-none select-none flex flex-col items-center justify-center opacity-10 ${className}`}>
        <svg
          width={240}
          height={280}
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Water Drop Shape */}
          <path
            d="M50 4 C50 4 14 52 14 74 C14 94 30 106 50 106 C70 106 86 94 86 74 C86 52 50 4 50 4 Z"
            stroke="#0284c7"
            strokeWidth="5"
            fill="none"
          />
          {/* TI Monogram */}
          <text
            x="50"
            y="82"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="32"
            fill="#0284c7"
            letterSpacing="-1"
          >
            TI
          </text>
          {/* Waves / Water Ripples */}
          <path
            d="M8 112 C28 119 72 119 92 112"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M20 117 C35 121 65 121 80 117"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <div className="text-center font-bold text-sky-900 tracking-wider mt-2 text-sm uppercase">
          ALE. TECNINSTALER S.A.S. • NIT 901.458.720-3
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Precision Water Drop Icon */}
      <div className="relative shrink-0 flex items-center justify-center drop-shadow-sm">
        <svg
          width={icon}
          height={icon * 1.18}
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Outer Drop Gradient */}
            <linearGradient id="tiDropGradient" x1="50" y1="4" x2="50" y2="106" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* Inner Drop Fill Gradient */}
            <linearGradient id="tiInnerFill" x1="50" y1="12" x2="50" y2="98" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0f9ff" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="tiGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Outer Border Drop */}
          <path
            d="M50 5 C50 5 15 52 15 74 C15 93.5 30.5 106 50 106 C69.5 106 85 93.5 85 74 C85 52 50 5 50 5 Z"
            fill="url(#tiDropGradient)"
            filter="url(#tiGlow)"
          />

          {/* Inner Cutout White Area */}
          <path
            d="M50 18 C50 18 24 55 24 74 C24 88.5 35.5 98 50 98 C64.5 98 76 88.5 76 74 C76 55 50 18 50 18 Z"
            fill="url(#tiInnerFill)"
          />

          {/* Bold TI Monogram */}
          <text
            x="50"
            y="81"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="33"
            fill="#0284c7"
            letterSpacing="-1.5"
          >
            TI
          </text>

          {/* Dynamic Water Ripples */}
          <path
            d="M8 112 C28 119 72 119 92 112"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M20 117 C35 121 65 121 80 117"
            stroke="#0369a1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight leading-none ${
                theme === 'white'
                  ? 'text-white'
                  : theme === 'dark'
                  ? 'text-slate-900'
                  : 'text-slate-100'
              } ${sizeMap[size].textTitle}`}
            >
              ALE. TECNINSTALER
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-600/15 text-sky-700 dark:text-sky-400 border border-sky-500/20">
              S.A.S.
            </span>
          </div>

          {textVariant === 'full' && (
            <span
              className={`font-medium tracking-wide uppercase mt-0.5 ${
                theme === 'white'
                  ? 'text-sky-100/90'
                  : theme === 'dark'
                  ? 'text-slate-600'
                  : 'text-slate-400'
              } ${sizeMap[size].textSub}`}
            >
              Ingeniería & Mantenimiento Hidráulico
            </span>
          )}
          {textVariant === 'short' && (
            <span className="text-[11px] font-medium text-slate-500">
              Gestión Integral Hidráulica
            </span>
          )}
        </div>
      )}
    </div>
  );
};
