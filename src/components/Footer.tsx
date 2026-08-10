import React from 'react';
import { PageId } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { 
  Cross, MapPin, Phone, Mail, Clock, Heart, 
  Instagram, Facebook, Youtube, Music, MessageCircle, ArrowUp, Lock
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenPrayerModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrayerModal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 relative font-sans">
      {/* Top Decorative Border Accent */}
      <div className="h-1 bg-gradient-to-r from-[#102bde] via-blue-500 to-emerald-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#102bde] text-white font-black">
                <Cross className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans text-lg font-extrabold text-white tracking-tight uppercase">
                  IMW Cosmópolis
                </h3>
                <p className="text-xs text-[#102bde] font-bold tracking-wider uppercase">
                  Igreja Metodista Wesleyana
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">
              &quot;{CHURCH_INFO.motto}&quot;. Uma comunidade de fé acolhedora em Cosmópolis/SP dedicada a pregar o Evangelho de Jesus Cristo com renovação espiritual, amor e serviço social.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenPrayerModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#102bde]/10 hover:bg-[#102bde]/20 border border-[#102bde]/30 text-[#102bde] text-xs font-bold transition-all cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-[#102bde] fill-[#102bde]/30" />
                <span>Enviar Pedido de Oração</span>
              </button>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div>
            <h4 className="font-sans text-xs font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
              Navegação Rápida
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#102bde] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-[#102bde] font-bold">›</span> Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('history')}
                  className="hover:text-[#102bde] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-[#102bde] font-bold">›</span> Nossa História & Liderança
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ministries')}
                  className="hover:text-[#102bde] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-[#102bde] font-bold">›</span> Os 7 Ministérios
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('schedule')}
                  className="hover:text-[#102bde] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-[#102bde] font-bold">›</span> Cultos e Programação
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('sermons')}
                  className="hover:text-[#102bde] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-[#102bde] font-bold">›</span> Pregações (Vídeo & Áudio)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#102bde] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-[#102bde] font-bold">›</span> Contato & Localização
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Main Schedule */}
          <div>
            <h4 className="font-sans text-xs font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
              Horários de Culto
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#102bde] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Domingo - 09h00</span>
                  <span className="text-slate-400 text-xs">Escola Bíblica Dominical (EBD)</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#102bde] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Domingo - 18h00</span>
                  <span className="text-slate-400 text-xs">Culto da Família & Celebração</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#102bde] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Terça-feira - 19h30</span>
                  <span className="text-slate-400 text-xs">Culto de Oração & Ensino</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#102bde] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Quinta-feira - 19h30</span>
                  <span className="text-slate-400 text-xs">Culto de Doutrina & Vitória</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#102bde] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Sábado - 19h30</span>
                  <span className="text-slate-400 text-xs">Culto de Jovens (Mocidade)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
              Fale Conosco
            </h4>
            
            <div className="space-y-2.5 text-sm text-slate-300">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#102bde] shrink-0 mt-1" />
                <span>{CHURCH_INFO.address.fullAddress}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#102bde] shrink-0" />
                <span>{CHURCH_INFO.contacts.phone}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#102bde] shrink-0" />
                <span className="text-xs break-all">{CHURCH_INFO.contacts.email}</span>
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2.5 font-bold uppercase tracking-wider">Redes Sociais:</p>
              <div className="flex items-center gap-2">
                <a
                  href={CHURCH_INFO.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-pink-600 text-slate-200 hover:text-white transition-colors border border-slate-700"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={CHURCH_INFO.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition-colors border border-slate-700"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={CHURCH_INFO.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white transition-colors border border-slate-700"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href={CHURCH_INFO.socials.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-colors border border-slate-700"
                  aria-label="Spotify"
                >
                  <Music className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${CHURCH_INFO.contacts.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-white transition-colors border border-slate-700"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 mt-12 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-sans">
          <p>© {new Date().getFullYear()} Igreja Metodista Wesleyana de Cosmópolis - Todos os direitos reservados.</p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-slate-200 transition-colors"
            >
              Secretaria Pastoral
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3 text-[#102bde]" />
              <span>Painel Admin</span>
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[#102bde] hover:text-[#0d23b8] transition-colors font-bold cursor-pointer"
            >
              <span>Voltar ao topo</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
