import React, { useState, useEffect, useRef } from 'react';
import { PageId } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { Logo } from './Logo';
import { 
  Menu, X, Heart, ChevronRight, ChevronDown, MessageCircle, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentPage: PageId;
  selectedMinistryId?: string;
  onNavigate: (page: PageId, extraParam?: string) => void;
  onOpenPrayerModal: () => void;
}

// PROGRAMMING SUBMENU DEFINITION (ONLY PAGE NAMES)
const PROGRAMMING_SUBITEMS = [
  { id: 'schedule' as PageId, label: 'Eventos Locais' },
  { id: 'district-events' as PageId, label: 'Distrito de Campinas' },
  { id: 'regional-events' as PageId, label: 'Eventos Regionais' },
];

// SCALABLE MINISTRIES SUBMENU DEFINITION (ONLY PAGE NAMES)
const MINISTRY_SUBITEMS = [
  { id: 'all', label: 'Todos os Ministérios' },
  { id: 'criancas', label: 'Infantil' },
  { id: 'pre-adolescentes', label: 'Pré-Adolescentes' },
  { id: 'adolescentes', label: 'Adolescentes' },
  { id: 'jovens', label: 'Jovens' },
  { id: 'homens', label: 'Homens' },
  { id: 'mulheres', label: 'Mulheres' },
  { id: 'melhor-idade', label: 'Melhor Idade' },
  { id: 'louvor', label: 'Louvor' },
  { id: 'intercessao', label: 'Intercessão' },
  { id: 'outros', label: 'Outros Ministérios' },
];

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  selectedMinistryId,
  onNavigate,
  onOpenPrayerModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Desktop active dropdown state
  const [openDropdown, setOpenDropdown] = useState<'schedule' | 'ministries' | null>(null);

  // Mobile expandable accordion state
  const [mobileExpanded, setMobileExpanded] = useState<'schedule' | 'ministries' | null>(null);

  // Grace timer for smooth mouse movement
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMouseEnter = (menu: 'schedule' | 'ministries') => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setOpenDropdown(menu);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  const handleNavClick = (pageId: PageId, extraParam?: string) => {
    onNavigate(pageId, extraParam);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper check for active parent menu
  const isScheduleActive = ['schedule', 'district-events', 'regional-events', 'event-detail'].includes(currentPage);
  const isMinistriesActive = currentPage === 'ministries';

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full transition-all duration-300">
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
      <nav className={`bg-white/95 backdrop-blur-xl border-b border-slate-200/90 transition-all duration-300 ${isScrolled ? 'py-2.5 shadow-md shadow-slate-200/50' : 'py-3.5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Logo onClick={() => handleNavClick('home')} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5 font-sans text-xs font-bold tracking-wider">
            
            {/* 1. INÍCIO */}
            <button
              onClick={() => handleNavClick('home')}
              className={`relative px-3 py-2 transition-all cursor-pointer rounded ${
                currentPage === 'home'
                  ? 'text-[#102bde] font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              INÍCIO
              {currentPage === 'home' && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#102bde] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* 2. SOBRE */}
            <button
              onClick={() => handleNavClick('history')}
              className={`relative px-3 py-2 transition-all cursor-pointer rounded ${
                currentPage === 'history'
                  ? 'text-[#102bde] font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              SOBRE
              {currentPage === 'history' && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#102bde] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* 3. PROGRAMAÇÃO (SUBMENU DROPDOWN) */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('schedule')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                id="nav-schedule-trigger"
                aria-expanded={openDropdown === 'schedule'}
                aria-haspopup="true"
                aria-controls="desktop-submenu-schedule"
                onClick={() => {
                  if (openDropdown === 'schedule') {
                    handleNavClick('schedule');
                  } else {
                    setOpenDropdown('schedule');
                  }
                }}
                className={`relative px-3 py-2 transition-all cursor-pointer rounded flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#102bde] focus-visible:outline-none ${
                  isScheduleActive
                    ? 'text-[#102bde] font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span>PROGRAMAÇÃO</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'schedule' ? 'rotate-180 text-[#102bde]' : 'text-slate-400'}`} />
                {isScheduleActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#102bde] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* PROGRAMMING DROPDOWN POPUP */}
              <AnimatePresence>
                {openDropdown === 'schedule' && (
                  <motion.div
                    id="desktop-submenu-schedule"
                    role="menu"
                    aria-labelledby="nav-schedule-trigger"
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-200/90 shadow-xl shadow-slate-900/10 p-1.5 z-50 ring-1 ring-slate-900/5 space-y-0.5"
                  >
                    {PROGRAMMING_SUBITEMS.map((sub) => {
                      const isSubActive = currentPage === sub.id;
                      return (
                        <button
                          key={sub.id}
                          role="menuitem"
                          onClick={() => handleNavClick(sub.id)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer block ${
                            isSubActive 
                              ? 'bg-[#102bde]/10 text-[#102bde] font-extrabold' 
                              : 'text-slate-700 hover:text-[#102bde] hover:bg-slate-50'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. MINISTÉRIOS (SUBMENU DROPDOWN) */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('ministries')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                id="nav-ministries-trigger"
                aria-expanded={openDropdown === 'ministries'}
                aria-haspopup="true"
                aria-controls="desktop-submenu-ministries"
                onClick={() => {
                  if (openDropdown === 'ministries') {
                    handleNavClick('ministries');
                  } else {
                    setOpenDropdown('ministries');
                  }
                }}
                className={`relative px-3 py-2 transition-all cursor-pointer rounded flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#102bde] focus-visible:outline-none ${
                  isMinistriesActive
                    ? 'text-[#102bde] font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span>MINISTÉRIOS</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'ministries' ? 'rotate-180 text-[#102bde]' : 'text-slate-400'}`} />
                {isMinistriesActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#102bde] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* MINISTRIES DROPDOWN POPUP */}
              <AnimatePresence>
                {openDropdown === 'ministries' && (
                  <motion.div
                    id="desktop-submenu-ministries"
                    role="menu"
                    aria-labelledby="nav-ministries-trigger"
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl border border-slate-200/90 shadow-xl shadow-slate-900/10 p-1.5 z-50 ring-1 ring-slate-900/5 space-y-0.5 max-h-[75vh] overflow-y-auto"
                  >
                    {MINISTRY_SUBITEMS.map((sub) => {
                      const isAll = sub.id === 'all';
                      const isSubActive = isMinistriesActive && (
                        (isAll && !selectedMinistryId) || selectedMinistryId === sub.id
                      );
                      return (
                        <button
                          key={sub.id}
                          role="menuitem"
                          onClick={() => handleNavClick('ministries', isAll ? undefined : sub.id)}
                          className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer block ${
                            isSubActive 
                              ? 'bg-[#102bde]/10 text-[#102bde] font-extrabold' 
                              : isAll
                                ? 'text-slate-900 hover:text-[#102bde] hover:bg-slate-50 border-b border-slate-100 mb-1 pb-2'
                                : 'text-slate-700 hover:text-[#102bde] hover:bg-slate-50'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 5. MENSAGENS */}
            <button
              onClick={() => handleNavClick('sermons')}
              className={`relative px-3 py-2 transition-all cursor-pointer rounded ${
                currentPage === 'sermons'
                  ? 'text-[#102bde] font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              MENSAGENS
              {currentPage === 'sermons' && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#102bde] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* 6. DOAÇÕES */}
            <button
              onClick={() => handleNavClick('donations')}
              className={`relative px-3 py-2 transition-all cursor-pointer rounded ${
                currentPage === 'donations'
                  ? 'text-[#102bde] font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              DOAÇÕES
              {currentPage === 'donations' && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#102bde] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* 7. CONTATO */}
            <button
              onClick={() => handleNavClick('contact')}
              className={`relative px-3 py-2 transition-all cursor-pointer rounded ${
                currentPage === 'contact'
                  ? 'text-[#102bde] font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              CONTATO
              {currentPage === 'contact' && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#102bde] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Watch Live CTA Pill */}
            <a
              href="https://youtube.com/live/38EHVyRv4k0?feature=share"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-4 py-2 text-xs font-sans font-extrabold uppercase tracking-wider text-white bg-[#102bde] hover:bg-[#0d23b8] rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#102bde]/20 active:scale-95 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ASSISTIR</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              aria-label="Abrir menu principal"
              aria-expanded={isMobileMenuOpen}
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
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="px-5 pt-4 pb-8 space-y-2">
              <div className="text-[10px] font-sans font-bold text-[#102bde] uppercase tracking-widest pb-1 border-b border-slate-100">
                NAVEGAÇÃO PRINCIPAL
              </div>

              {/* 1. INÍCIO */}
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                  currentPage === 'home'
                    ? 'bg-[#102bde]/10 text-[#102bde] border border-[#102bde]/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>INÍCIO</span>
                <ChevronRight className={`w-4 h-4 ${currentPage === 'home' ? 'text-[#102bde]' : 'text-slate-400'}`} />
              </button>

              {/* 2. SOBRE */}
              <button
                onClick={() => handleNavClick('history')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                  currentPage === 'history'
                    ? 'bg-[#102bde]/10 text-[#102bde] border border-[#102bde]/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>SOBRE NÓS</span>
                <ChevronRight className={`w-4 h-4 ${currentPage === 'history' ? 'text-[#102bde]' : 'text-slate-400'}`} />
              </button>

              {/* 3. PROGRAMAÇÃO ACCORDION */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === 'schedule' ? null : 'schedule')}
                  className="w-full flex items-center justify-between px-4 py-3.5 font-sans text-xs font-black tracking-wider uppercase text-slate-800 cursor-pointer"
                  aria-expanded={mobileExpanded === 'schedule'}
                >
                  <div className="flex items-center gap-2">
                    <span className={isScheduleActive ? 'text-[#102bde]' : ''}>PROGRAMAÇÃO</span>
                    {isScheduleActive && (
                      <span className="w-2 h-2 rounded-full bg-[#102bde]" />
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === 'schedule' ? 'rotate-180 text-[#102bde]' : 'text-slate-400'}`} />
                </button>

                <AnimatePresence>
                  {mobileExpanded === 'schedule' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 pb-2 space-y-1 border-t border-slate-200/60 bg-white pt-2"
                    >
                      {PROGRAMMING_SUBITEMS.map((sub) => {
                        const isSubActive = currentPage === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNavClick(sub.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer block ${
                              isSubActive 
                                ? 'bg-[#102bde]/10 text-[#102bde] font-black' 
                                : 'text-slate-700 hover:bg-slate-100 font-bold'
                            }`}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. MINISTÉRIOS ACCORDION */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === 'ministries' ? null : 'ministries')}
                  className="w-full flex items-center justify-between px-4 py-3.5 font-sans text-xs font-black tracking-wider uppercase text-slate-800 cursor-pointer"
                  aria-expanded={mobileExpanded === 'ministries'}
                >
                  <div className="flex items-center gap-2">
                    <span className={isMinistriesActive ? 'text-[#102bde]' : ''}>MINISTÉRIOS</span>
                    {isMinistriesActive && (
                      <span className="w-2 h-2 rounded-full bg-[#102bde]" />
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === 'ministries' ? 'rotate-180 text-[#102bde]' : 'text-slate-400'}`} />
                </button>

                <AnimatePresence>
                  {mobileExpanded === 'ministries' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 pb-2 space-y-1 border-t border-slate-200/60 bg-white pt-2 max-h-64 overflow-y-auto"
                    >
                      {MINISTRY_SUBITEMS.map((sub) => {
                        const isAll = sub.id === 'all';
                        const isSubActive = isMinistriesActive && (
                          (isAll && !selectedMinistryId) || selectedMinistryId === sub.id
                        );
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNavClick('ministries', isAll ? undefined : sub.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer block ${
                              isSubActive 
                                ? 'bg-[#102bde]/10 text-[#102bde] font-black' 
                                : isAll 
                                  ? 'text-[#102bde] font-extrabold border-b border-slate-100 pb-2 mb-1' 
                                  : 'text-slate-700 hover:bg-slate-100 font-bold'
                            }`}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 5. MENSAGENS */}
              <button
                onClick={() => handleNavClick('sermons')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                  currentPage === 'sermons'
                    ? 'bg-[#102bde]/10 text-[#102bde] border border-[#102bde]/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>MENSAGENS</span>
                <ChevronRight className={`w-4 h-4 ${currentPage === 'sermons' ? 'text-[#102bde]' : 'text-slate-400'}`} />
              </button>

              {/* 6. DOAÇÕES */}
              <button
                onClick={() => handleNavClick('donations')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                  currentPage === 'donations'
                    ? 'bg-[#102bde]/10 text-[#102bde] border border-[#102bde]/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>DOAÇÕES</span>
                <ChevronRight className={`w-4 h-4 ${currentPage === 'donations' ? 'text-[#102bde]' : 'text-slate-400'}`} />
              </button>

              {/* 7. CONTATO */}
              <button
                onClick={() => handleNavClick('contact')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                  currentPage === 'contact'
                    ? 'bg-[#102bde]/10 text-[#102bde] border border-[#102bde]/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>CONTATO</span>
                <ChevronRight className={`w-4 h-4 ${currentPage === 'contact' ? 'text-[#102bde]' : 'text-slate-400'}`} />
              </button>

              <div className="pt-4 border-t border-slate-200 mt-4 space-y-3">
                <a
                  href="https://youtube.com/live/38EHVyRv4k0?feature=share"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white text-xs font-sans font-black tracking-wider uppercase cursor-pointer shadow-md shadow-[#102bde]/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>ASSISTIR A CULTOS</span>
                </a>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPrayerModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-sans font-bold tracking-wider cursor-pointer hover:bg-slate-200"
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
