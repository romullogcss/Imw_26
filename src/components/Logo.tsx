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
    <div className={`relative flex items-center justify-center ${sizeClass} rounded-xl ${variant === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} shadow-sm overflow-hidden shrink-0`}>
      {/* Official Methodist Cross & Flame SVG */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-3/4 h-3/4 relative z-10" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M58 18C58 18 42 28 42 45C42 52 46 58 46 58C46 58 38 52 38 42C38 30 50 20 50 20C50 20 30 32 30 54C30 72 44 82 56 82C70 82 80 70 80 54C80 34 58 18 58 18Z" 
          fill={variant === 'dark' ? 'black' : 'white'}
        />
        <path 
          d="M28 22H36V40H54V48H36V80H28V48H10V40H28V22Z" 
          fill={variant === 'dark' ? 'black' : 'white'}
        />
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
  const rawUrl = customLogoUrl !== undefined && customLogoUrl !== '' 
    ? customLogoUrl 
    : (CHURCH_INFO.logoUrl || '/imw-logo.svg');
  
  // Normalize legacy or relative paths to public absolute path /imw-logo.svg
  const activeLogoUrl = (rawUrl === 'assets/imw-logo.svg' || rawUrl === 'public/imw-logo.svg' || rawUrl === './imw-logo.svg' || rawUrl === 'imw-logo.svg')
    ? '/imw-logo.svg'
    : rawUrl;

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
            className={`max-h-full max-w-full object-contain ${
              variant === 'dark' 
                ? 'brightness-0 invert [filter:brightness(0)_invert(1)]' 
                : 'brightness-0 [filter:brightness(0)]'
            } ${imgClassName}`}
          />
        </div>
      ) : (
        <WesleyanaEmblem sizeClass={emblemSizes[size]} variant={variant} />
      )}

      {showText && (
        <div className="flex flex-col">
          <span className={`font-sans font-black ${textSizes[size]} tracking-tight uppercase leading-none ${
            variant === 'dark'
              ? 'text-white hover:text-white focus:text-white active:text-white visited:text-white group-hover:text-white'
              : 'text-black hover:text-black focus:text-black active:text-black visited:text-black group-hover:text-black'
          }`}>
            IMW COSMÓPOLIS
          </span>
          <span className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase leading-tight mt-0.5 ${
            variant === 'dark'
              ? 'text-white/90 hover:text-white focus:text-white active:text-white visited:text-white group-hover:text-white'
              : 'text-black hover:text-black focus:text-black active:text-black visited:text-black group-hover:text-black'
          }`}>
            Igreja Metodista Wesleyana
          </span>
        </div>
      )}
    </div>
  );
};

