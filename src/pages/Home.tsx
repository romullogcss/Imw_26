import React, { useState, useEffect } from 'react';
import { PageId, Sermon, ScheduleItem } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { subscribeSermons, subscribeSchedules } from '../services/firestoreService';
import { 
  Calendar, Play, Heart, MapPin, ChevronRight, BookOpen, 
  Clock, Users, Sparkles, Cross, ArrowRight, Video, Music,
  Compass, ExternalLink, Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigate: (page: PageId, extraParam?: string) => void;
  onOpenPrayerModal: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onOpenPrayerModal }) => {
  const [sermonsList, setSermonsList] = useState<Sermon[]>([]);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const unsubSermons = subscribeSermons((items) => {
      setSermonsList(items || []);
    });
    const unsubSched = subscribeSchedules((items) => {
      setScheduleList(items || []);
    });
    return () => {
      unsubSermons();
      unsubSched();
    };
  }, []);

  const latestSermon = sermonsList[0];
  const highlightedServices = scheduleList.filter(s => s.isHighlight || s.day === 'Domingo');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* ELEVATION-STYLE HERO SECTION WITH ATMOSPHERIC BACKGROUND IMAGE */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-slate-200 bg-slate-900 text-white">
        {/* Background Overlay Image - Altere a URL da imagem abaixo no código conforme desejado */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transform transition-transform duration-1000"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1570786032462-2efc3ca8fccd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/85 to-slate-950" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#102bde]/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 font-sans text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
            <span>{CHURCH_INFO.motto}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-sans font-black text-4xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-white uppercase max-w-5xl mx-auto leading-none drop-shadow-md"
          >
            BEM-VINDO À <br />
            <span className="text-[#3b52f5]">
              SUA CASA
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-slate-200 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed drop-shadow"
          >
            Igreja Metodista Wesleyana em Cosmópolis. Um lugar para adorar, crescer e viver o propósito que Deus planejou para você.
          </motion.p>

          {/* Versículo em Destaque Elevation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 max-w-3xl mx-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/80 p-6 md:p-8 rounded-2xl relative shadow-xl"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#102bde] text-white px-3 py-0.5 rounded text-[10px] font-sans font-extrabold uppercase tracking-widest shadow">
              VERSÍCULO DA CASA
            </div>
            <p className="text-base sm:text-xl font-semibold text-slate-100 italic leading-relaxed">
              &quot;{CHURCH_INFO.verseText}&quot;
            </p>
            <p className="text-xs font-sans font-black text-blue-400 uppercase tracking-widest mt-3">
              — {CHURCH_INFO.verseReference}
            </p>
          </motion.div>

          {/* Elevation Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={() => onNavigate('sermons')}
              className="px-8 py-4 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>ASSISTIR PREGAÇÕES</span>
            </button>

            <button
              onClick={() => onNavigate('schedule')}
              className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 text-[#102bde]" />
              <span>CULTOS DA SEMANA</span>
            </button>

            <button
              onClick={onOpenPrayerModal}
              className="px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-sans font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Heart className="w-4 h-4 text-[#102bde] fill-[#102bde]/20" />
              <span>PEDIR ORAÇÃO</span>
            </button>
          </motion.div>

          <div className="mt-12 flex items-center justify-center gap-2 text-xs font-sans text-slate-500 font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#102bde]" />
            <span>{CHURCH_INFO.address.fullAddress}</span>
          </div>

        </div>
      </section>

      {/* ELEVATION SPOTLIGHT: LATEST SERMON */}
      <section className="py-16 md:py-24 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-2">
              MENSAGEM MAIS RECENTE
            </span>
            <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase text-slate-900 tracking-tight">
              ASSISTA ONLINE
            </h2>
            <p className="text-slate-600 text-sm mt-3 font-medium">
              Não pôde estar no culto presencial? Edifique sua vida com a palavra trazida neste domingo.
            </p>
          </div>

          {latestSermon ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#102bde]/10 text-[#102bde] text-[11px] font-sans font-extrabold uppercase tracking-wider border border-[#102bde]/20">
                  <Video className="w-3.5 h-3.5" />
                  <span>DESTAQUE ONLINE</span>
                </div>

                <h3 className="font-sans font-black text-2xl sm:text-4xl text-slate-900 uppercase leading-tight">
                  {latestSermon.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-slate-500">
                  <span className="text-[#102bde] font-bold uppercase">Pregador: {latestSermon.preacher}</span>
                  <span>•</span>
                  <span>Data: {latestSermon.date}</span>
                  <span>•</span>
                  <span className="text-slate-700 font-semibold">Base: {latestSermon.scripture}</span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {latestSermon.summary || 'Uma mensagem inspiradora sobre a Palavra de Deus para edificar sua fé e transformar sua vida cotidiana.'}
                </p>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => onNavigate('sermons')}
                    className="px-6 py-3.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>ASSISTIR AGORA</span>
                  </button>

                  <button
                    onClick={() => onNavigate('sermons')}
                    className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 text-xs font-sans font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Music className="w-4 h-4 text-emerald-400" />
                    <span>OUVIR NO SPOTIFY</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div 
                  onClick={() => onNavigate('sermons')}
                  className="relative rounded-xl overflow-hidden border border-slate-200 group cursor-pointer shadow-md"
                >
                  <img
                    src={latestSermon.thumbnail || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800'}
                    alt={latestSermon.title}
                    className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#102bde] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 fill-white ml-1" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-md max-w-2xl mx-auto space-y-4">
              <Video className="w-12 h-12 text-[#102bde] mx-auto" />
              <h3 className="font-sans font-black text-2xl text-slate-900 uppercase">
                MENSAGENS & PREGAÇÕES DA IMW
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Ouça nossos episódios no Podcast do Spotify e confira a página de mensagens para ouvir e assistir às palavras ministradas.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => onNavigate('sermons')}
                  className="px-6 py-3 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <Music className="w-4 h-4" />
                  <span>ACESSAR MENSAGENS & PODCAST</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ELEVATION STYLE "PRÓXIMOS PASSOS" GRID */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-2">
                FAÇA PARTE DA FAMÍLIA
              </span>
              <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase text-slate-900 tracking-tight">
                PRÓXIMOS PASSOS
              </h2>
            </div>
            <button
              onClick={() => onNavigate('ministries')}
              className="inline-flex items-center gap-2 text-xs font-sans font-extrabold text-[#102bde] hover:text-[#0d23b8] uppercase tracking-widest cursor-pointer"
            >
              <span>VER TODOS OS MINISTÉRIOS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div 
              onClick={() => onNavigate('contact')}
              className="bg-slate-50 border border-slate-200 hover:border-[#102bde] rounded-2xl p-6 transition-all cursor-pointer group shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#102bde]/10 border border-[#102bde]/20 text-[#102bde] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-black text-xl text-slate-900 uppercase mb-2 group-hover:text-[#102bde] transition-colors">
                  VISITAR ESTE DOMINGO
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Confira nossos horários, localização no Google Maps e como chegar na nossa igreja.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-sans font-black text-[#102bde] uppercase tracking-widest">
                <span>PLANEAR VISITA</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => onNavigate('ministries')}
              className="bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-2xl p-6 transition-all cursor-pointer group shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-200 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-black text-xl text-slate-900 uppercase mb-2 group-hover:text-blue-600 transition-colors">
                  7 MINISTÉRIOS
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Crianças, jovens, casais, homens, mulheres, idosos e louvor. Encontre seu grupo de comunhão.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-sans font-black text-blue-600 uppercase tracking-widest">
                <span>CONHECER GRUPOS</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div 
              onClick={onOpenPrayerModal}
              className="bg-slate-50 border border-slate-200 hover:border-pink-500 rounded-2xl p-6 transition-all cursor-pointer group shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-200 text-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 fill-pink-500/20" />
                </div>
                <h3 className="font-sans font-black text-xl text-slate-900 uppercase mb-2 group-hover:text-pink-600 transition-colors">
                  PEDIR ORAÇÃO
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Nossa equipe pastoral e ministério de intercessão oram diariamente pelas suas intenções.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-sans font-black text-pink-600 uppercase tracking-widest">
                <span>ENVIAR PEDIDO</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => onNavigate('history')}
              className="bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-2xl p-6 transition-all cursor-pointer group shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-black text-xl text-slate-900 uppercase mb-2 group-hover:text-emerald-600 transition-colors">
                  NOSSA HISTÓRIA
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Conheça nossa trajetória em Cosmópolis, nossa visão bíblica e nossos líderes pastorais.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-sans font-black text-emerald-600 uppercase tracking-widest">
                <span>SAIBA MAIS</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ELEVATION STYLE WEEKLY SCHEDULE */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-2">
              JUNTE-SE A NÓS
            </span>
            <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase text-slate-900 tracking-tight">
              CULTOS & ENCONTROS
            </h2>
            <p className="text-slate-600 text-sm mt-3 font-medium">
              Ambientes preparados com adoração vibrante e mensagens transformadoras.
            </p>
          </div>

          {highlightedServices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm">
              <Calendar className="w-10 h-10 text-[#102bde] mx-auto mb-3" />
              <h3 className="font-sans font-black text-lg text-slate-900 uppercase">
                AGENDA SEMANAL DA IMW
              </h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Acompanhe a página de agenda para ver horários de cultos, reuniões e eventos.
              </p>
              <button
                onClick={() => onNavigate('schedule')}
                className="mt-4 px-6 py-3 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm"
              >
                VER AGENDA COMPLETA
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {highlightedServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-[#102bde] transition-all shadow-sm hover:shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-md bg-[#102bde] text-white text-xs font-sans font-black uppercase tracking-wider">
                        {service.day} • {service.time}
                      </span>
                      <span className="text-xs font-sans text-slate-500 uppercase font-bold">
                        {service.location}
                      </span>
                    </div>

                    <h3 className="font-sans font-black text-2xl text-slate-900 uppercase mb-2 group-hover:text-[#102bde] transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-slate-600 text-xs leading-relaxed mb-6 font-medium">
                      {service.description}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('schedule')}
                    className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-sans font-extrabold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-[#102bde]" />
                    <span>VER DETALHES</span>
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* PASTORAL WELCOME SECTION */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
                <img
                  src="/foto-pastor-gessivaldo-gomes-reboucas.png"
                  alt="Pastores Titulares IMW Cosmópolis"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="font-sans font-black text-xl uppercase text-white">Pr. Carlos Eduardo & Pra. Ana Maria</p>
                  <p className="text-xs font-sans font-bold text-[#102bde] uppercase tracking-widest mt-1">Pastores Titulares IMW Cosmópolis</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block">
                CORAÇÃO DA IGREJA
              </span>

              <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase text-slate-900 leading-tight">
                UMA CASA PARA TODA A SUA FAMÍLIA
              </h2>

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium">
                Acreditamos que a igreja não é um edifício, mas sim uma família reunida em torno do amor de Jesus Cristo. Na IMW Cosmópolis, você encontrará um lugar seguro para crescer espiritualmente, fazer amigos sinceros e servir à comunidade.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-sans font-bold text-slate-900 text-sm uppercase flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-[#102bde]" />
                    <span>PALAVRA BÍBLICA</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Mensagens práticas e doutrina firme para fortalecer a sua fé no dia a dia.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-sans font-bold text-slate-900 text-sm uppercase flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>COMUNHÃO VERDADEIRA</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Ministérios dedicados a todas as faixas etárias e fases da vida.
                  </p>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => onNavigate('history')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md"
                >
                  <span>CONHEÇA NOSSA HISTÓRIA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

