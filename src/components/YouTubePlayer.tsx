import React, { useState } from 'react';
import { Youtube, ExternalLink, AlertCircle } from 'lucide-react';
import { getYoutubeEmbedUrl, getYoutubeWatchUrl, getYoutubeThumbnailUrl } from '../utils/youtube';

interface YouTubePlayerProps {
  urlOrId: string | null | undefined;
  title?: string;
  thumbnail?: string;
  className?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  urlOrId,
  title = 'Vídeo no YouTube',
  thumbnail,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const embedUrl = getYoutubeEmbedUrl(urlOrId);
  const watchUrl = getYoutubeWatchUrl(urlOrId);
  const fallbackThumbnail = thumbnail || getYoutubeThumbnailUrl(urlOrId);

  // If no embed URL can be generated
  if (!embedUrl || hasError) {
    return (
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 text-white flex flex-col items-center justify-center p-6 border border-slate-200 shadow-md ${className}`}>
        {fallbackThumbnail && (
          <img
            src={fallbackThumbnail}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xs"
          />
        )}
        <div className="relative z-10 text-center space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center mx-auto shadow-lg">
            <Youtube className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">
            {title}
          </h3>
          <p className="text-xs text-slate-300">
            Não foi possível reproduzir o vídeo diretamente no navegador. Você pode assisti-lo diretamente no YouTube.
          </p>
          {watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer mt-1"
            >
              <Youtube className="w-4 h-4" />
              <span>Assistir no YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg border border-slate-200 ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onError={() => setHasError(true)}
      />
    </div>
  );
};
