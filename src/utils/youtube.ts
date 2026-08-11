/**
 * YouTube Utility Functions for URL Parsing, ID Extraction, and Embed Generation.
 */

/**
 * Extracts the 11-character YouTube video ID from various URL formats or plain ID string.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&t=10s&si=abc
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtu.be/VIDEO_ID?t=10
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - Plain 11-character Video ID string
 */
export function extractYoutubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct 11-character Video ID pattern (alphanumeric, hyphen, underscore)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex patterns to match video ID from various YouTube URL structures
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/i,
    /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?.*v=([\w-]{11})/i,
    /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([\w-]{11})/i,
    /^(?:https?:\/\/)?(?:www\.)?youtube-nocookie\.com\/embed\/([\w-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates if the input string is a valid YouTube URL or video ID.
 */
export function isValidYoutubeUrl(input: string | null | undefined): boolean {
  return extractYoutubeId(input) !== null;
}

/**
 * Generates a clean, secure YouTube embed URL.
 * Uses youtube-nocookie.com by default for enhanced privacy and compatibility.
 * Example: https://www.youtube-nocookie.com/embed/VIDEO_ID?autoplay=0&rel=0&modestbranding=1
 */
export function getYoutubeEmbedUrl(input: string | null | undefined, options: { autoplay?: boolean; rel?: number } = {}): string {
  const videoId = extractYoutubeId(input);
  if (!videoId) return '';

  const autoplay = options.autoplay ? '1' : '0';
  const rel = options.rel !== undefined ? String(options.rel) : '0';

  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay}&rel=${rel}&modestbranding=1`;
}

/**
 * Returns a standard YouTube watch URL for direct links or fallback button.
 */
export function getYoutubeWatchUrl(input: string | null | undefined): string {
  const videoId = extractYoutubeId(input);
  if (!videoId) return input || '';
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Returns the high resolution thumbnail URL for a video.
 */
export function getYoutubeThumbnailUrl(input: string | null | undefined): string {
  const videoId = extractYoutubeId(input);
  if (!videoId) return 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
