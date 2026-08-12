/**
 * Spotify Utility Functions for URL Parsing, ID Extraction, and Embed Generation.
 */

export type SpotifyResourceType = 'show' | 'episode' | 'playlist' | 'track' | 'album';

export interface SpotifyInfo {
  type: SpotifyResourceType;
  id: string;
  embedUrl: string;
  spotifyUrl: string;
}

/**
 * Extracts Spotify resource type and ID from various Spotify URL or URI formats.
 * Supported formats:
 * - https://open.spotify.com/show/0axmDAHLlBF1rDWvhMkrUA?si=8af466b30f7c44a9
 * - https://open.spotify.com/embed/show/0axmDAHLlBF1rDWvhMkrUA
 * - https://open.spotify.com/episode/4rG8...
 * - https://open.spotify.com/playlist/37i9...
 * - https://open.spotify.com/track/4cOd...
 * - https://open.spotify.com/album/1DFi...
 * - spotify:show:0axmDAHLlBF1rDWvhMkrUA
 * - spotify:episode:4rG8...
 */
export function parseSpotifyUrl(input: string | null | undefined): SpotifyInfo | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Regex pattern for web URLs (open.spotify.com/type/id or open.spotify.com/embed/type/id)
  const webMatch = trimmed.match(/open\.spotify\.com\/(?:embed\/)?(show|episode|playlist|track|album)\/([a-zA-Z0-9]+)/i);
  if (webMatch && webMatch[1] && webMatch[2]) {
    const type = webMatch[1].toLowerCase() as SpotifyResourceType;
    const id = webMatch[2];
    return {
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      spotifyUrl: `https://open.spotify.com/${type}/${id}`
    };
  }

  // Regex pattern for Spotify URIs (spotify:type:id)
  const uriMatch = trimmed.match(/spotify:(show|episode|playlist|track|album):([a-zA-Z0-9]+)/i);
  if (uriMatch && uriMatch[1] && uriMatch[2]) {
    const type = uriMatch[1].toLowerCase() as SpotifyResourceType;
    const id = uriMatch[2];
    return {
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      spotifyUrl: `https://open.spotify.com/${type}/${id}`
    };
  }

  return null;
}

/**
 * Validates if the input string is a valid Spotify URL or URI.
 */
export function isValidSpotifyUrl(input: string | null | undefined): boolean {
  return parseSpotifyUrl(input) !== null;
}

/**
 * Generates an embed URL for Spotify iframe.
 */
export function getSpotifyEmbedUrl(input: string | null | undefined): string {
  const info = parseSpotifyUrl(input);
  return info ? info.embedUrl : '';
}

/**
 * Generates a standard web URL to open in Spotify app/web.
 */
export function getSpotifyWebUrl(input: string | null | undefined): string {
  const info = parseSpotifyUrl(input);
  return info ? info.spotifyUrl : (input || 'https://open.spotify.com');
}

/**
 * Returns human readable Portuguese label for resource type.
 */
export function getSpotifyTypeLabel(type: SpotifyResourceType): string {
  switch (type) {
    case 'show':
      return 'Podcast / Show';
    case 'episode':
      return 'Episódio';
    case 'playlist':
      return 'Playlist';
    case 'track':
      return 'Música';
    case 'album':
      return 'Álbum';
    default:
      return 'Conteúdo do Spotify';
  }
}
