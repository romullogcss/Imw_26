import React, { useState, useEffect } from 'react';
import { SERMONS_YOUTUBE, SPOTIFY_PLAYLIST } from '../data/churchData';
import { subscribeSermons, subscribeChurchSettings, ChurchSettingsData } from '../services/firestoreService';
import { Sermon } from '../types';
import { formatDateToDisplay } from '../utils/dateUtils';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { SpotifyPlayer } from '../components/SpotifyPlayer';
import { getSpotifyWebUrl } from '../utils/spotify';
import { 
  Play, Youtube, Music, Search, Calendar, User, 
  BookOpen, Clock, Filter, ExternalLink, Sparkles, Video
} from 'lucide-react';
import { motion } from 'motion/react';

export const SermonsPage: React.FC = () => {
  const [sermonsList, setSermonsList] = useState<Sermon[]>([]);
  const [activeVideo, setActiveVideo] = useState<Sermon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [churchSettings, setChurchSettings] = useState<ChurchSettingsData>({});

  useEffect(() => {
    const unsub = subscribeSermons((items) => {
      const list = items || [];
      setSermonsList(list);
      if (list.length > 0) {
        if (!activeVideo || !list.find(s => s.id === activeVideo.id)) {
          setActiveVideo(list[0]);
        }
      } else {
        setActiveVideo(null);
      }
    });

    const unsubSettings = subscribeChurchSettings((settings) => {
      setChurchSettings(settings);
    });

    return () => {
      unsub();
      unsubSettings();
    };
  }, []);

  const currentSpotifyUrl = churchSettings.spotifyUrl || SPOTIFY_PLAYLIST.spotifyUrl;

  const categories = ['Todas', 'Vida Cristã', 'Oração', 'Doutrina & História', 'Fé e Esperança', 'Juventude', 'Domingo da Família'];

  const filteredSermons = sermonsList.filter(sermon => {
    const matchesSearch = 
      sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.preacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.scripture.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todas' || sermon.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* ELEVATION MEDIA HERO BANNER */}
      <section className="bg-white text-slate-900 py-16 lg:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-sans font-black text-4xl sm:text-6xl uppercase text-slate-900 tracking-tight">
            MENSAGENS
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto mt-3 font-medium leading-relaxed">
            Assista às mensagens no YouTube ou ouça as pregações no Spotify.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-16">

        {/* SECTION 1: MAIN FEATURED YOUTUBE PLAYER */}
        {activeVideo ? (
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 text-slate-900 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-md">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] text-[#102bde] font-sans font-black uppercase tracking-widest block">
                    ASSISTIR NO YOUTUBE
                  </span>
                  <h2 className="font-sans font-black text-xl sm:text-3xl text-slate-900 uppercase">
                    {activeVideo.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-sans font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 uppercase">
                <Calendar className="w-4 h-4 text-[#102bde]" />
                <span>{formatDateToDisplay(activeVideo.date)}</span>
              </div>
            </div>

            {/* YouTube Iframe Embed */}
            <YouTubePlayer
              urlOrId={activeVideo.embedUrl || activeVideo.youtubeUrl || activeVideo.youtubeId}
              title={activeVideo.title}
              thumbnail={activeVideo.thumbnail}
            />

            {/* Video Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs sm:text-sm font-sans text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 uppercase font-medium">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#102bde] shrink-0" />
                <span><strong className="text-slate-900 font-extrabold">PREGADOR:</strong> {activeVideo.preacher}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#102bde] shrink-0" />
                <span><strong className="text-slate-900 font-extrabold">TEXTO:</strong> {activeVideo.scripture}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#102bde] shrink-0" />
                <span><strong className="text-slate-900 font-extrabold">DURAÇÃO:</strong> {activeVideo.duration}</span>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-2xl p-10 border border-slate-200 text-center shadow-sm">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-sans font-black text-xl text-slate-900 uppercase">
              NENHUMA PREGAÇÃO EM VÍDEO CADASTRADA
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-md mx-auto">
              Utilize o Painel Administrativo para cadastrar novos vídeos e sermões do YouTube.
            </p>
          </section>
        )}

        {/* SECTION 2: YOUTUBE VIDEO GALLERY & SEARCH */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-1">
                TODAS AS MENSAGENS
              </span>
              <h2 className="font-sans font-black text-2xl sm:text-4xl uppercase text-slate-900">
                LISTA DE PREGAÇÕES
              </h2>
            </div>

            {/* Search Input & Category Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por título, pastor..."
                  className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#102bde] shadow-sm"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-sans font-bold text-slate-700 focus:outline-none focus:border-[#102bde] cursor-pointer uppercase shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Videos Grid */}
          {filteredSermons.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Nenhuma pregação encontrada para exibição.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSermons.map((sermon) => {
                const isActive = activeVideo?.id === sermon.id;
                return (
                  <div
                    key={sermon.id}
                    onClick={() => {
                      setActiveVideo(sermon);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className={`bg-white rounded-xl overflow-hidden border transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-[#102bde] group flex flex-col justify-between ${
                      isActive ? 'border-[#102bde] ring-2 ring-[#102bde]/30' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={sermon.thumbnail}
                          alt={sermon.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                            isActive ? 'bg-[#102bde] text-white scale-110' : 'bg-white/90 text-slate-900 group-hover:bg-[#102bde] group-hover:text-white'
                          }`}>
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-md bg-white/90 text-[#102bde] font-sans font-black text-[10px] uppercase tracking-wider border border-slate-200 shadow-sm">
                            {sermon.category}
                          </span>
                        </div>

                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-sans text-[10px] font-bold">
                          {sermon.duration}
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="font-sans font-black text-slate-900 text-lg leading-snug uppercase group-hover:text-[#102bde] transition-colors">
                          {sermon.title}
                        </h3>
                        
                        <p className="text-xs font-sans font-bold text-[#102bde] uppercase">
                          {sermon.preacher}
                        </p>

                        <div className="flex items-center justify-between text-[11px] font-sans text-slate-500 pt-2 border-t border-slate-100 uppercase font-medium">
                          <span>📖 {sermon.scripture}</span>
                          <span>{formatDateToDisplay(sermon.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`px-5 py-3 border-t text-xs font-sans font-extrabold uppercase tracking-wider flex items-center justify-between ${
                      isActive ? 'bg-[#102bde]/10 text-[#102bde] border-[#102bde]/30' : 'bg-slate-50 text-slate-600 group-hover:text-[#102bde]'
                    }`}>
                      <span>{isActive ? 'EM EXIBIÇÃO NO PLAYER' : 'ASSISTIR MENSAGEM'}</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 3: SPOTIFY PLAYLIST EMBEDDED PLAYER */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 text-slate-900 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-600 font-sans font-black uppercase tracking-widest block">
                  OUVIR NO SPOTIFY
                </span>
                <h2 className="font-sans font-black text-2xl uppercase text-slate-900">
                  PODCAST & PREGAÇÕES EM ÁUDIO
                </h2>
              </div>
            </div>

            <a
              href={getSpotifyWebUrl(currentSpotifyUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer shrink-0"
            >
              <span>ABRIR NO APP SPOTIFY</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Spotify Embedded Component */}
          <SpotifyPlayer
            spotifyUrl={currentSpotifyUrl}
            title="Podcast Oficial IMW Cosmópolis no Spotify"
          />
        </section>

      </div>
    </div>
  );
};

