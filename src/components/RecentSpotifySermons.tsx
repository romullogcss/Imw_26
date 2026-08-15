import React, { useState, useEffect } from 'react';
import { 
  fetchLatestSpotifyEpisodes, 
  SpotifyEpisode, 
  SpotifyApiResponse 
} from '../services/spotifyService';
import { 
  Music, ExternalLink, Calendar, Clock, Play, Pause, 
  Radio, RefreshCw, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { motion } from 'motion/react';

interface RecentSpotifySermonsProps {
  limit?: number;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  className?: string;
}

export const RecentSpotifySermons: React.FC<RecentSpotifySermonsProps> = ({
  limit = 6,
  title = 'PREGAÇÕES RECENTES NO SPOTIFY',
  subtitle = 'Acompanhe as últimas mensagens e ensinamentos em áudio do nosso podcast oficial.',
  showHeader = true,
  className = '',
}) => {
  const [episodes, setEpisodes] = useState<SpotifyEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseInfo, setResponseInfo] = useState<SpotifyApiResponse | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const loadEpisodes = async (force: boolean = false) => {
    setLoading(true);
    const res = await fetchLatestSpotifyEpisodes(limit, force);
    setResponseInfo(res);
    setEpisodes(res.episodes || []);
    setLoading(false);
  };

  useEffect(() => {
    loadEpisodes();
  }, [limit]);

  const toggleAudioPreview = (episode: SpotifyEpisode) => {
    if (!episode.audioPreviewUrl) return;

    if (playingAudioId === episode.id) {
      audioElement?.pause();
      setPlayingAudioId(null);
    } else {
      audioElement?.pause();
      const newAudio = new Audio(episode.audioPreviewUrl);
      newAudio.play().catch((err) => console.warn('Erro ao tocar áudio:', err));
      newAudio.onended = () => setPlayingAudioId(null);
      setAudioElement(newAudio);
      setPlayingAudioId(episode.id);
    }
  };

  return (
    <section className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300 inline-flex">
                <Radio className="w-4 h-4 animate-pulse text-emerald-600" />
              </span>
              <span className="text-xs font-sans font-black text-emerald-600 uppercase tracking-widest">
                SPOTIFY PODCAST
              </span>
            </div>
            <h2 className="font-sans font-black text-2xl sm:text-3xl text-slate-900 uppercase tracking-tight">
              {title}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => loadEpisodes(true)}
              disabled={loading}
              title="Atualizar episódios do Spotify"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <a
              href="https://open.spotify.com/show/0axmDAHLlBF1rDWvhMkrUA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Music className="w-4 h-4" />
              <span>Ver Canal no Spotify</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Sync Status Banner */}
      {responseInfo && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            {responseInfo.configured ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>API Oficial Spotify Sincronizada</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700 font-medium text-[11px]">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Exibindo episódios recentes (Para API em tempo real, configure SPOTIFY_CLIENT_ID no servidor)</span>
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">
            {responseInfo.count} {responseInfo.count === 1 ? 'mensagem' : 'mensagens'}
          </span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
              <div className="h-44 bg-slate-200 rounded-xl w-full" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-10 bg-slate-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Episodes Grid */}
      {!loading && episodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {episodes.map((episode) => {
            const isPlaying = playingAudioId === episode.id;

            return (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Cover Image Header */}
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <img
                      src={episode.imageUrl}
                      alt={episode.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-xs text-white font-sans font-black text-[10px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        <span>Pregação Áudio</span>
                      </span>
                    </div>

                    {/* Duration Badge */}
                    {episode.durationFormatted && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-200 text-[10px] font-bold font-sans flex items-center gap-1 border border-white/10">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{episode.durationFormatted}</span>
                      </div>
                    )}

                    {/* Optional Audio Preview Play Button */}
                    {episode.audioPreviewUrl && (
                      <button
                        onClick={() => toggleAudioPreview(episode)}
                        title={isPlaying ? 'Pausar prévia' : 'Ouvir prévia'}
                        className={`absolute bottom-3 right-3 p-3 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer ${
                          isPlaying ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-sans font-extrabold text-emerald-700 uppercase">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{episode.releaseDateFormatted || episode.releaseDate}</span>
                    </div>

                    <h3 className="font-sans font-black text-slate-900 text-lg uppercase leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {episode.title}
                    </h3>

                    {episode.description && (
                      <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {episode.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0">
                  <a
                    href={episode.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-black text-xs uppercase tracking-wider transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <Music className="w-4 h-4" />
                    <span>Ouvir no Spotify</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Fallback Empty State */}
      {!loading && episodes.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3 shadow-xs">
          <Music className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-sans font-black text-slate-900 uppercase text-lg">
            Nenhuma pregação encontrada no momento
          </h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Acesse diretamente o canal da IMW Cosmópolis no Spotify para ouvir todas as mensagens gravadas.
          </p>
          <a
            href="https://open.spotify.com/show/0axmDAHLlBF1rDWvhMkrUA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider"
          >
            Abrir Podcast no Spotify
          </a>
        </div>
      )}
    </section>
  );
};
