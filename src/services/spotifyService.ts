export interface SpotifyEpisode {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  releaseDateFormatted: string;
  durationMs: number;
  durationFormatted: string;
  imageUrl: string;
  spotifyUrl: string;
  audioPreviewUrl: string | null;
  showTitle?: string;
}

export interface SpotifyApiResponse {
  success: boolean;
  configured: boolean;
  cached?: boolean;
  source: 'spotify_api_live' | 'spotify_api_cache' | 'fallback';
  count: number;
  episodes: SpotifyEpisode[];
  message?: string;
  error?: string;
}

export interface SpotifyApiStatus {
  configured: boolean;
  hasClientId: boolean;
  hasClientSecret: boolean;
  showId: string;
  cachedEpisodesCount: number;
  cacheAgeSeconds: number | null;
}

const DEFAULT_FALLBACK_EPISODES: SpotifyEpisode[] = [
  {
    id: 'fb-1',
    title: 'A Relevância da Graça Preveniente na Prática',
    description: 'Um estudo profundo e prático sobre a graça preveniente de Deus na jornada cristã diária e na edificação da comunidade de fé da IMW Cosmópolis.',
    releaseDate: '2026-02-10',
    releaseDateFormatted: '10 de Fevereiro de 2026',
    durationMs: 2292000,
    durationFormatted: '38 min',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
    spotifyUrl: 'https://open.spotify.com/show/0axmDAHLlBF1rDWvhMkrUA',
    audioPreviewUrl: null,
    showTitle: 'Podcast IMW Cosmópolis',
  },
  {
    id: 'fb-2',
    title: 'Restaurando o Altar da Família',
    description: 'Mensagem abençoada sobre os princípios bíblicos para fortalecer o culto doméstico, o amor conjugal e a educação de filhos em Cristo.',
    releaseDate: '2026-02-03',
    releaseDateFormatted: '3 de Fevereiro de 2026',
    durationMs: 2465000,
    durationFormatted: '41 min',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
    spotifyUrl: 'https://open.spotify.com/show/0axmDAHLlBF1rDWvhMkrUA',
    audioPreviewUrl: null,
    showTitle: 'Podcast IMW Cosmópolis',
  },
  {
    id: 'fb-3',
    title: 'O Poder da Oração Persistente',
    description: 'Pregação expositiva focada no papel da oração no avivamento pessoal e na transformação espiritual de vidas e famílias.',
    releaseDate: '2026-01-27',
    releaseDateFormatted: '27 de Janeiro de 2026',
    durationMs: 2100000,
    durationFormatted: '35 min',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    spotifyUrl: 'https://open.spotify.com/show/0axmDAHLlBF1rDWvhMkrUA',
    audioPreviewUrl: null,
    showTitle: 'Podcast IMW Cosmópolis',
  },
];

export async function fetchLatestSpotifyEpisodes(limit: number = 6, force: boolean = false): Promise<SpotifyApiResponse> {
  try {
    const url = `/api/spotify/episodes?limit=${limit}${force ? '&force=true' : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Servidor respondeu com HTTP ${res.status}`);
    }
    const data: SpotifyApiResponse = await res.json();
    return data;
  } catch (err: any) {
    console.warn('[Spotify client] Erro ao buscar pregações no backend, utilizando fallback:', err?.message || err);
    return {
      success: false,
      configured: false,
      source: 'fallback',
      count: DEFAULT_FALLBACK_EPISODES.length,
      episodes: DEFAULT_FALLBACK_EPISODES.slice(0, limit),
      error: err?.message || 'Não foi possível conectar ao servidor backend do Spotify',
    };
  }
}

export async function checkSpotifyStatus(): Promise<SpotifyApiStatus | null> {
  try {
    const res = await fetch('/api/spotify/status');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[Spotify status check error]', err);
    return null;
  }
}
