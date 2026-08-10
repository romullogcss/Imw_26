import React, { useState } from 'react';
import { CHURCH_INFO } from '../data/churchData';

interface LogoProps {
  className?: string;
  imgClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark';
  onClick?: () => void;
  customLogoUrl?: string;
}

export const WesleyanaEmblem: React.FC<{ sizeClass?: string; variant?: 'light' | 'dark' }> = ({ 
  sizeClass = 'w-10 h-10', 
  variant = 'light' 
}) => {
  return (
    <div className={`relative flex items-center justify-center ${sizeClass} rounded-xl bg-gradient-to-br from-[#102bde] via-blue-700 to-indigo-900 text-white shadow-md shadow-[#102bde]/25 overflow-hidden group-hover:scale-105 transition-transform shrink-0`}>
      {/* Background Subtle Flame glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 via-amber-400/20 to-transparent opacity-90" />
      
      {/* Official Methodist Cross & Flame SVG */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-3/4 h-3/4 relative z-10 drop-shadow-sm" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Flame Background shape */}
        <path 
          d="M58 18C58 18 42 28 42 45C42 52 46 58 46 58C46 58 38 52 38 42C38 30 50 20 50 20C50 20 30 32 30 54C30 72 44 82 56 82C70 82 80 70 80 54C80 34 58 18 58 18Z" 
          fill="url(#flameGradient)"
        />
        {/* Inner Flame highlights */}
        <path 
          d="M62 32C62 32 50 40 50 52C50 58 54 62 54 62C54 62 48 58 48 50C48 40 56 34 56 34C56 34 42 42 42 58C42 70 52 76 60 76C70 76 74 68 74 58C74 44 62 32 62 32Z" 
          fill="url(#innerFlameGradient)"
        />
        {/* Cross */}
        <path 
          d="M28 22H36V40H54V48H36V80H28V48H10V40H28V22Z" 
          fill="white" 
        />
        <defs>
          <linearGradient id="flameGradient" x1="55" y1="18" x2="55" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBBF24" />
            <stop offset="0.5" stopColor="#F97316" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="innerFlameGradient" x1="58" y1="32" x2="58" y2="76" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  imgClassName = '',
  size = 'md',
  showText = true,
  variant = 'light',
  onClick,
  customLogoUrl,
}) => {
  const activeLogoUrl = customLogoUrl !== undefined ? customLogoUrl : (CHURCH_INFO.logoUrl || '');
  const [imageError, setImageError] = useState(false);

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  const emblemSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-3 text-left group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {activeLogoUrl && !imageError ? (
        <div className={`flex items-center justify-center ${emblemSizes[size]} shrink-0`}>
          <img
            src={activeLogoUrl}
            alt="Logo IMW Cosmópolis"
            onError={() => setImageError(true)}
            className={`max-h-full max-w-full object-contain rounded-lg transition-transform group-hover:scale-105 ${imgClassName}`}
          />
        </div>
      ) : (
        <WesleyanaEmblem sizeClass={emblemSizes[size]} variant={variant} />
      )}

      {showText && (
        <div className="flex flex-col">
          <span className={`font-sans font-black ${textSizes[size]} tracking-tight uppercase leading-none transition-colors ${
            variant === 'dark' ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-[#102bde]'
          }`}>
            IMW <span className="text-[#102bde]">COSMÓPOLIS</span>
          </span>
          <span className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase leading-tight mt-0.5 ${
            variant === 'dark' ? 'text-blue-300/80' : 'text-slate-500'
          }`}>
            Igreja Metodista Wesleyana
          </span>
        </div>
      )}
    </div>
  );
};
