import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const DEFAULT_SHOW_ID = '0axmDAHLlBF1rDWvhMkrUA';

interface SpotifyTokenCache {
  accessToken: string;
  expiresAt: number;
}

interface SpotifyEpisodesCache {
  showId: string;
  fetchedAt: number;
  episodes: any[];
}

let tokenCache: SpotifyTokenCache | null = null;
let episodesCache: SpotifyEpisodesCache | null = null;
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutos de cache inteligente

function formatDatePtBR(dateString: string): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return dateString;
  } catch (e) {
    return dateString;
  }
}

function formatDuration(ms: number): string {
  if (!ms) return '';
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}min`;
  }
  return `${totalMinutes} min`;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
}

// Pregações/Episódios de fallback caso as chaves não estejam configuradas ou a API do Spotify esteja temporariamente fora
const FALLBACK_EPISODES = [
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

async function getSpotifyAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.accessToken;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha na autenticação com Spotify API (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const accessToken = data.access_token;
  const expiresIn = data.expires_in || 3600;

  tokenCache = {
    accessToken,
    expiresAt: now + expiresIn * 1000,
  };

  return accessToken;
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // Rota de status de integração do Spotify
  app.get('/api/spotify/status', (req, res) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
    const showId = process.env.SPOTIFY_SHOW_ID?.trim() || DEFAULT_SHOW_ID;

    const isConfigured = Boolean(clientId && clientSecret);

    res.json({
      configured: isConfigured,
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
      showId,
      cachedEpisodesCount: episodesCache?.episodes?.length || 0,
      cacheAgeSeconds: episodesCache ? Math.round((Date.now() - episodesCache.fetchedAt) / 1000) : null,
    });
  });

  // Rota para buscar pregações/episódios mais recentes do Spotify
  app.get('/api/spotify/episodes', async (req, res) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
    const showId = (req.query.showId as string) || process.env.SPOTIFY_SHOW_ID?.trim() || DEFAULT_SHOW_ID;
    const limit = Math.min(parseInt((req.query.limit as string) || '6', 10), 20);
    const forceRefresh = req.query.force === 'true';

    // 1. Verificar cache em memória
    const now = Date.now();
    if (
      !forceRefresh &&
      episodesCache &&
      episodesCache.showId === showId &&
      now - episodesCache.fetchedAt < CACHE_DURATION_MS &&
      episodesCache.episodes.length > 0
    ) {
      return res.json({
        success: true,
        configured: true,
        cached: true,
        source: 'spotify_api_cache',
        count: Math.min(episodesCache.episodes.length, limit),
        episodes: episodesCache.episodes.slice(0, limit),
      });
    }

    // 2. Se as credenciais não estiverem configuradas, usar fallback gracioso
    if (!clientId || !clientSecret) {
      console.warn('[Spotify API] Credenciais SPOTIFY_CLIENT_ID e/ou SPOTIFY_CLIENT_SECRET não foram configuradas.');
      return res.json({
        success: true,
        configured: false,
        cached: false,
        source: 'fallback',
        message: 'Aviso: Adicione SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET nas variáveis de ambiente para sincronização automática em tempo real.',
        count: FALLBACK_EPISODES.length,
        episodes: FALLBACK_EPISODES.slice(0, limit),
      });
    }

    // 3. Buscar na API Oficial do Spotify
    try {
      const accessToken = await getSpotifyAccessToken(clientId, clientSecret);

      const spotifyRes = await fetch(
        `https://api.spotify.com/v1/shows/${showId}/episodes?market=BR&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!spotifyRes.ok) {
        const errBody = await spotifyRes.text();
        console.error(`[Spotify API Error] ${spotifyRes.status} ao buscar show ${showId}:`, errBody);
        
        // Retornar fallback sem quebrar a página
        return res.json({
          success: false,
          configured: true,
          cached: false,
          source: 'fallback',
          error: `Erro ao buscar no Spotify: HTTP ${spotifyRes.status}`,
          episodes: FALLBACK_EPISODES.slice(0, limit),
        });
      }

      const data = await spotifyRes.json();
      const items = data.items || [];

      // Mapear episódios limpos
      const formattedEpisodes = items.map((ep: any) => {
        const rawDate = ep.release_date || '';
        const coverImage =
          ep.images?.[0]?.url ||
          ep.images?.[1]?.url ||
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800';

        return {
          id: ep.id,
          title: ep.name,
          description: stripHtml(ep.html_description || ep.description || ''),
          releaseDate: rawDate,
          releaseDateFormatted: formatDatePtBR(rawDate),
          durationMs: ep.duration_ms || 0,
          durationFormatted: formatDuration(ep.duration_ms || 0),
          imageUrl: coverImage,
          spotifyUrl: ep.external_urls?.spotify || `https://open.spotify.com/episode/${ep.id}`,
          audioPreviewUrl: ep.audio_preview_url || null,
          showTitle: 'Podcast IMW Cosmópolis',
        };
      });

      // Salvar em cache
      episodesCache = {
        showId,
        fetchedAt: now,
        episodes: formattedEpisodes,
      };

      return res.json({
        success: true,
        configured: true,
        cached: false,
        source: 'spotify_api_live',
        count: formattedEpisodes.length,
        episodes: formattedEpisodes,
      });
    } catch (err: any) {
      console.error('[Spotify API Exceção]', err?.message || err);

      // Tratar falha graciosamente sem derrubar a aplicação
      return res.json({
        success: false,
        configured: true,
        cached: false,
        source: 'fallback',
        error: err?.message || 'Falha de conexão com a API do Spotify',
        episodes: FALLBACK_EPISODES.slice(0, limit),
      });
    }
  });

  // Configuração do Vite Middleware em desenvolvimento ou arquivos estáticos em produção
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Servidor IMW Cosmópolis] Rodando na porta ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Servidor Fatal Erro ao Iniciar]', err);
});
