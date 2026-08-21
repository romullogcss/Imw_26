import React, { useState } from 'react';
import { PageId } from '../types';
import { ArrowLeft, ChevronRight, Calendar, MapPin, Sparkles, Image as ImageIcon } from 'lucide-react';

export interface EventsPageHeaderProps {
  title: string;
  badge?: string;
  description: string;
  backgroundImageUrl?: string;
  currentScope: 'local' | 'distrital' | 'regional';
  onNavigate?: (page: PageId, extraParam?: string) => void;
  customBadgeClass?: string;
}

export const EventsPageHeader: React.FC<EventsPageHeaderProps> = ({
  title,
  badge,
  description,
  backgroundImageUrl,
  currentScope,
  onNavigate,
  customBadgeClass,
}) => {
  const [imageError, setImageError] = useState(false);

  // Scope thematic active styling
  const scopeThemes = {
    local: {
      badgeBg: 'bg-[#102bde] text-white',
      fallbackBg: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
      dotColor: '#3b82f6',
      accentText: 'text-blue-400',
    },
    distrital: {
      badgeBg: 'bg-amber-500 text-slate-950 font-black',
      fallbackBg: 'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900',
      dotColor: '#f59e0b',
      accentText: 'text-amber-400',
    },
    regional: {
      badgeBg: 'bg-purple-600 text-white font-black',
      fallbackBg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950',
      dotColor: '#c084fc',
      accentText: 'text-purple-300',
    },
  };

  const theme = scopeThemes[currentScope] || scopeThemes.local;
  const hasValidImage = Boolean(backgroundImageUrl && !imageError);

  return (
    <section className={`relative text-white py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xl min-h-[300px] flex items-center ${
      !hasValidImage ? theme.fallbackBg : 'bg-slate-950'
    }`}>
      {/* Background Image Layer with Fallback */}
      {backgroundImageUrl && !imageError && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={backgroundImageUrl}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          {/* High Contrast Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/80 sm:from-slate-950/95 sm:via-slate-950/90 sm:to-slate-900/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
        </div>
      )}

      {/* Decorative Radial Pattern Layer */}
      <div 
        className="absolute inset-0 z-[1] opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${theme.dotColor} 1px, transparent 1px)`,
          backgroundSize: '18px 18px',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-4">
        
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
          {title}
        </h1>

        {/* Description */}
        <p className="text-slate-200 text-sm sm:text-base max-w-2xl font-medium leading-relaxed drop-shadow-sm">
          {description}
        </p>

        {/* Quick Scope Navigation Switcher */}
        {onNavigate && (
          <div className="pt-4 flex items-center gap-2 flex-wrap">
            
            {/* 1. EVENTOS LOCAIS */}
            {currentScope === 'local' ? (
              <span className={`px-4 py-2 rounded-xl ${theme.badgeBg} text-xs font-sans font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-default`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>EVENTOS LOCAIS</span>
              </span>
            ) : (
              <button
                onClick={() => onNavigate('schedule')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                aria-label="Ir para Eventos Locais"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>EVENTOS LOCAIS</span>
              </button>
            )}

            {/* 2. EVENTOS DISTRITAIS */}
            {currentScope === 'distrital' ? (
              <span className={`px-4 py-2 rounded-xl ${theme.badgeBg} text-xs font-sans font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-default`}>
                <MapPin className="w-3.5 h-3.5" />
                <span>DISTRITAIS</span>
              </span>
            ) : (
              <button
                onClick={() => onNavigate('district-events')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                aria-label="Ir para Eventos Distritais"
              >
                <span>📍 DISTRITAIS</span>
              </button>
            )}

            {/* 3. EVENTOS REGIONAIS */}
            {currentScope === 'regional' ? (
              <span className={`px-4 py-2 rounded-xl ${theme.badgeBg} text-xs font-sans font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-default`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>REGIONAIS</span>
              </span>
            ) : (
              <button
                onClick={() => onNavigate('regional-events')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                aria-label="Ir para Eventos Regionais"
              >
                <span>🏛️ REGIONAIS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

          </div>
        )}

      </div>
    </section>
  );
};
