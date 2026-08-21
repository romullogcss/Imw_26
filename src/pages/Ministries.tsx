import React, { useState, useEffect } from 'react';
import { MINISTRIES_DATA } from '../data/churchData';
import { subscribeMinistries } from '../services/firestoreService';
import { Ministry } from '../types';
import { 
  Users, Clock, MapPin, Phone, ChevronRight, X, 
  Sparkles, Heart, Calendar, Image as ImageIcon, CheckCircle, 
  ArrowLeft, MessageCircle, Smile, Flame, Shield, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MinistriesPageProps {
  initialMinistryId?: string;
}

export const MinistriesPage: React.FC<MinistriesPageProps> = ({ initialMinistryId }) => {
  const [ministriesList, setMinistriesList] = useState<Ministry[]>(MINISTRIES_DATA);
  const [selectedMinistryId, setSelectedMinistryId] = useState<string | null>(initialMinistryId || null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption: string } | null>(null);

  useEffect(() => {
    setSelectedMinistryId(initialMinistryId || null);
  }, [initialMinistryId]);

  useEffect(() => {
    const unsub = subscribeMinistries((items) => {
      if (items && items.length > 0) {
        setMinistriesList(items);
      } else {
        setMinistriesList(MINISTRIES_DATA);
      }
    });
    return () => unsub();
  }, []);

  const selectedMinistry = ministriesList.find(m => m.id === selectedMinistryId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* ELEVATION HERO BANNER */}
      <section className="bg-white text-slate-900 py-16 lg:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-2">
            SERVIÇO & COMUNHÃO
          </span>
          <h1 className="font-sans font-black text-4xl sm:text-6xl uppercase text-slate-900 tracking-tight">
            NOSSOS MINISTÉRIOS
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto mt-3 font-medium leading-relaxed">
            Grupos e ministérios preparados para conectar você em cada etapa da sua jornada de fé.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* SUB-PAGE / DETAIL VIEW IF A MINISTRY IS SELECTED */}
        {selectedMinistry ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Back Button */}
            <button
              onClick={() => setSelectedMinistryId(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors font-sans font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-[#102bde]" />
              <span>VOLTAR PARA TODOS OS MINISTÉRIOS</span>
            </button>

            {/* Ministry Sub-Page Hero Card */}
            <div className={`rounded-2xl p-8 lg:p-12 shadow-md relative overflow-hidden border ${
              selectedMinistry.isPlayful 
                ? 'bg-gradient-to-r from-blue-600 via-[#102bde] to-indigo-700 text-white border-blue-400' 
                : 'bg-slate-900 text-white border-slate-800'
            }`}>
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-md text-xs font-sans font-black uppercase tracking-wider ${
                    selectedMinistry.isPlayful 
                      ? 'bg-white text-slate-950 font-black shadow-sm' 
                      : 'bg-[#102bde] text-white'
                  }`}>
                    {selectedMinistry.ageRange}
                  </span>
                  <span className="text-xs text-blue-200 font-sans font-extrabold uppercase tracking-wider">
                    {selectedMinistry.subtitle}
                  </span>
                </div>

                <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase leading-tight">
                  {selectedMinistry.title}
                </h2>

                <p className="text-slate-100 font-sans text-sm sm:text-base leading-relaxed font-medium">
                  {selectedMinistry.detailedDescription}
                </p>

                {/* Quick Schedule Badge */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-sans">
                  <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-700 uppercase font-bold text-slate-100">
                    <Clock className="w-4 h-4 text-[#102bde]" />
                    <span>{selectedMinistry.meetingTime}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-700 uppercase font-bold text-slate-100">
                    <MapPin className="w-4 h-4 text-[#102bde]" />
                    <span>{selectedMinistry.meetingLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Page Grid: Leader Info & Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Leader Card */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-1">
                    LIDERANÇA RESPONSÁVEL
                  </span>
                  <h3 className="font-sans font-black text-2xl uppercase text-slate-900">
                    LÍDER DO MINISTÉRIO
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={selectedMinistry.leaderPhoto}
                    alt={selectedMinistry.leaderName}
                    loading="lazy"
                    className="w-20 h-20 rounded-xl object-cover border-2 border-[#102bde] shadow-md shrink-0"
                  />
                  <div>
                    <h4 className="font-sans font-black text-slate-900 text-lg uppercase">
                      {selectedMinistry.leaderName}
                    </h4>
                    <p className="text-xs font-sans font-bold text-[#102bde] uppercase mb-1">
                      {selectedMinistry.leaderRole}
                    </p>
                    <p className="text-xs font-sans text-slate-500">
                      Contato: {selectedMinistry.leaderContact}
                    </p>
                  </div>
                </div>

                {/* Main Activities List */}
                <div className="space-y-3 pt-2 font-sans">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    PRINCIPAIS ATIVIDADES:
                  </h4>
                  <ul className="space-y-2">
                    {selectedMinistry.activities.map((act, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                        <CheckCircle className="w-4 h-4 text-[#102bde] shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://wa.me/5519998765432?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20${encodeURIComponent(selectedMinistry.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>FALAR COM O LÍDER NO WHATSAPP</span>
                  </a>
                </div>
              </div>

              {/* Photo Gallery */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-1">
                      GALERIA DE REGISTROS
                    </span>
                    <h3 className="font-sans font-black text-2xl uppercase text-slate-900">
                      FOTOS DOS ENCONTROS
                    </h3>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400 font-bold uppercase">
                    Clique para ampliar
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedMinistry.gallery.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxImage({ url: img.url, caption: img.caption })}
                      className="group relative rounded-xl overflow-hidden h-48 border border-slate-200 bg-slate-100 cursor-pointer shadow-sm"
                    >
                      <img
                        src={img.url}
                        alt={img.caption}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-xs font-sans font-bold uppercase line-clamp-2">
                          {img.caption}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* MAIN 7 CARDS GRID VIEW */
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-sans font-black text-3xl uppercase text-slate-900">
                SELECIONE UM MINISTÉRIO
              </h2>
              <p className="text-slate-500 text-xs font-sans font-bold uppercase tracking-wider mt-1">
                Clique em um card para ver a sub-página completa com encontros, líderes e fotos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ministriesList.map((ministry) => {
                const isPlayful = ministry.isPlayful;

                return (
                  <motion.div
                    key={ministry.id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedMinistryId(ministry.id)}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#102bde] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="p-6 sm:p-8 space-y-4 font-sans">
                      {/* Badge & Age */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-md bg-[#102bde] text-white font-black text-[11px] uppercase tracking-wider">
                          {ministry.ageRange}
                        </span>

                        {isPlayful ? (
                          <span className="flex items-center gap-1 text-[11px] font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-300 uppercase">
                            <Smile className="w-3.5 h-3.5 text-blue-600" />
                            <span>Kids Lúdico</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-bold uppercase">
                            {ministry.subtitle}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-sans font-black text-2xl uppercase text-slate-900 group-hover:text-[#102bde] transition-colors">
                        {ministry.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                        {ministry.description}
                      </p>

                      {/* Meeting Time Preview */}
                      <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-bold uppercase">
                        <Clock className="w-3.5 h-3.5 text-[#102bde] shrink-0" />
                        <span>{ministry.meetingTime}</span>
                      </div>
                    </div>

                    {/* Bottom CTA Bar */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-sans font-black uppercase tracking-wider text-slate-600 group-hover:text-[#102bde] transition-colors">
                      <span>VER SUB-PÁGINA & GALERIA</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* LIGHTBOX MODAL FOR GALLERY IMAGES */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-3 right-3 p-2 rounded bg-slate-950/80 text-white hover:bg-slate-800 transition-colors z-10 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <img
                src={lightboxImage.url}
                alt={lightboxImage.caption}
                className="w-full max-h-[75vh] object-contain bg-black"
              />

              <div className="p-4 bg-slate-950 text-white text-center text-xs font-display font-bold uppercase tracking-wider">
                {lightboxImage.caption}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

