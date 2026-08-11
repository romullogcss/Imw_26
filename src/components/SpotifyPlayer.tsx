import React, { useState } from 'react';
import { Music, ExternalLink, AlertCircle } from 'lucide-react';
import { parseSpotifyUrl, getSpotifyWebUrl, getSpotifyTypeLabel } from '../utils/spotify';

interface SpotifyPlayerProps {
  spotifyUrl: string | null | undefined;
  title?: string;
  height?: number | string;
  className?: string;
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  spotifyUrl,
  title = 'Podcast Oficial & Pregações no Spotify',
  height = 352,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const info = parseSpotifyUrl(spotifyUrl);
  const webUrl = getSpotifyWebUrl(spotifyUrl);

  if (!info || hasError) {
    return (
      <div className={`rounded-xl p-6 bg-slate-50 border border-slate-200 text-slate-800 space-y-4 shadow-xs ${className}`}>
        <div className="flex items-center gap-3 text-amber-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider">
            Link do Spotify Indisponível
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Não foi possível carregar o player incorporado do Spotify. Certifique-se de que o link fornecido é válido no painel administrativo.
        </p>
        {webUrl && (
          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
          >
            <Music className="w-4 h-4" />
            <span>Abrir diretamente no Spotify</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    );
  }

  // Adjust default height according to content type if not custom specified
  const playerHeight = height || (info.type === 'track' ? 152 : 352);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner">
        <iframe
          style={{ borderRadius: '12px' }}
          src={info.embedUrl}
          width="100%"
          height={playerHeight}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={title}
          onError={() => setHasError(true)}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
        <span className="flex items-center gap-1.5 uppercase font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          {getSpotifyTypeLabel(info.type)}
        </span>
        <a
          href={webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
        >
          <span>Abrir no App</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
