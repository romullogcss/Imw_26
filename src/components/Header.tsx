import React, { useState, useEffect } from 'react';
import { PageId } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { Logo } from './Logo';
import { 
  Menu, X, Cross, Phone, MapPin, Calendar, Heart, 
  ChevronRight, Sparkles, MessageCircle, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenPrayerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenPrayerModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'INÍCIO' },
    { id: 'history', label: 'HISTÓRIA' },
    { id: 'ministries', label: 'MINISTÉRIOS' },
    { id: 'schedule', label: 'PROGRAMAÇÃO' },
    { id: 'sermons', label: 'PREGAÇÕES' },
    { id: 'contact', label: 'VISITAR' },
  ];

  const handleNavClick = (pageId: PageId) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Announce Bar */}
      <div className="bg-slate-100 text-slate-700 text-xs py-2 px-4 border-b border-slate-200/80 font-sans uppercase tracking-wider">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#102bde]/10 text-[#102bde] font-bold text-[11px] border border-[#102bde]/20">
              <span className="w-2 h-2 rounded-full bg-[#102bde] animate-ping" />
              CULTOS PRESENCIAIS
            </span>
            <span className="hidden md:inline text-slate-500 font-medium">
              Terça e Quinta às 19h30 | Domingo às 18h
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${CHURCH_INFO.contacts.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 transition-colors font-semibold text-[11px]"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>WHATSAPP</span>
            </a>
            <button
              onClick={onOpenPrayerModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#102bde]/10 text-[#102bde] hover:bg-[#102bde]/20 border border-[#102bde]/20 transition-all font-bold text-[11px] cursor-pointer"
            >
              <Heart className="w-3 h-3 text-[#102bde] fill-[#102bde]/30" />
              <span>PEDIR ORAÇÃO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Light Monochromatic Navbar */}
      <nav className={`bg-white/90 backdrop-blur-xl border-b border-slate-200/90 transition-all duration-300 ${isScrolled ? 'py-3 shadow-md shadow-slate-200/50' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Logo onClick={() => handleNavClick('home')} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 text-xs font-sans font-bold tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#102bde] font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#102bde] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {/* Watch Live CTA Pill */}
            <button
              onClick={() => handleNavClick('sermons')}
              className="ml-3 px-5 py-2.5 text-xs font-sans font-extrabold uppercase tracking-wider text-white bg-[#102bde] hover:bg-[#0d23b8] rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-[#102bde]/20 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ASSISTIR</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-[#102bde]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden shadow-xl"
          >
            <div className="px-5 pt-4 pb-8 space-y-2">
              <div className="text-[10px] font-sans font-bold text-[#102bde] uppercase tracking-widest pb-1 border-b border-slate-100">
                MENU PRINCIPAL
              </div>

              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg font-sans text-sm font-bold tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#102bde]/10 text-[#102bde] border border-[#102bde]/20'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#102bde]' : 'text-slate-400'}`} />
                  </button>
                );
              })}

              <div className="pt-4 border-t border-slate-200 mt-4 space-y-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNavClick('sermons');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-[#102bde] hover:bg-[#0d23b8] text-white text-xs font-sans font-black tracking-wider uppercase cursor-pointer shadow-md shadow-[#102bde]/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>ASSISTIR A PREGAÇÕES</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPrayerModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-sans font-bold tracking-wider cursor-pointer hover:bg-slate-200"
                >
                  <Heart className="w-4 h-4 text-[#102bde]" />
                  <span>PEDIR ORAÇÃO</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

