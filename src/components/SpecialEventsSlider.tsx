import React, { useState, useEffect, useRef } from 'react';
import { ChurchEvent, PageId } from '../types';
import { subscribeEvents } from '../services/firestoreService';
import { getEventSlug } from '../utils/slugUtils';
import { ChevronLeft, ChevronRight, Sparkles, Calendar } from 'lucide-react';

interface SpecialEventsSliderProps {
  onNavigate: (page: PageId, extraParam?: string) => void;
}

export const SpecialEventsSlider: React.FC<SpecialEventsSliderProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeEvents((items) => {
      // Filter events that have a non-empty cover image
      const validEvents = (items || []).filter((evt) => evt.imageUrl && evt.imageUrl.trim().length > 0);
      setEvents(validEvents);
    });
    return () => unsub();
  }, []);

  // Gentle Autoplay (slow and smooth)
  useEffect(() => {
    if (events.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [events.length, isPaused]);

  // Scroll container when currentIndex changes
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const card = container.children[currentIndex] as HTMLElement;
    if (card) {
      card.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, [currentIndex]);

  if (events.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const handleSlideClick = (eventItem: ChurchEvent) => {
    const slug = getEventSlug(eventItem);
    onNavigate('event-detail', slug);
  };

  return (
    <section 
      aria-label="Eventos Especiais em Destaque"
      className="w-full bg-slate-950 text-white py-12 md:py-16 border-b border-slate-800 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#102bde]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102bde]/20 border border-[#102bde]/40 text-blue-300 font-sans text-[11px] font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>DESTAQUES DA CASA</span>
            </div>
            <h2 className="font-sans font-black text-2xl sm:text-4xl uppercase tracking-tight text-white drop-shadow">
              EVENTOS ESPECIAIS
            </h2>
          </div>

          {/* Controls for Desktop */}
          {events.length > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Slide anterior"
                className="p-3 rounded-full bg-slate-900/90 hover:bg-[#102bde] text-slate-300 hover:text-white border border-slate-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#102bde] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Próximo slide"
                className="p-3 rounded-full bg-slate-900/90 hover:bg-[#102bde] text-slate-300 hover:text-white border border-slate-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#102bde] cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Full-width Carousel Track */}
        <div className="relative w-full">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory py-2 px-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {events.map((evt, idx) => {
              const slug = getEventSlug(evt);
              const isActive = idx === currentIndex;

              return (
                <div
                  key={evt.id || idx}
                  onClick={() => handleSlideClick(evt)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSlideClick(evt);
                    }
                  }}
                  className={`group relative flex-none w-[85vw] sm:w-[50vw] md:w-[38vw] lg:w-[30vw] xl:w-[26vw] h-[340px] sm:h-[400px] rounded-2xl overflow-hidden cursor-pointer snap-start border transition-all duration-500 ${
                    isActive
                      ? 'border-[#102bde] ring-2 ring-[#102bde]/40 shadow-2xl scale-[1.01]'
                      : 'border-slate-800 hover:border-slate-600 opacity-90 hover:opacity-100 shadow-lg'
                  }`}
                >
                  {/* Event Cover Image */}
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                  {/* Badge top-left optional accent */}
                  {evt.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-md bg-[#102bde] text-white font-sans font-black text-[10px] uppercase tracking-wider shadow-md">
                        {evt.badge}
                      </span>
                    </div>
                  )}

                  {/* Event Title strictly centered/bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10 space-y-2">
                    <h3 className="font-sans font-black text-xl sm:text-2xl text-white uppercase tracking-tight leading-snug drop-shadow-md group-hover:text-blue-200 transition-colors">
                      {evt.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Dots Navigation */}
        {events.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {events.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Ir para slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIndex ? 'w-8 bg-[#102bde]' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
