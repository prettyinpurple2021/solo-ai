/**
 * Parses learning module content for safe video/embed rendering.
 * Article and quiz modules use markdown; video modules store a URL in `content`.
 */

export type ParsedLessonMedia =
  | { kind: 'markdown' }
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'vimeo'; embedUrl: string }
  | { kind: 'video'; src: string }
  | { kind: 'external'; href: string }
  | { kind: 'invalid' };

function toYouTubeEmbed(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = u.searchParams.get('v');
      if (v) {
        return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
      }
      const shorts = u.pathname.match(/^\/shorts\/([^/?#]+)/);
      if (shorts?.[1]) {
        return `https://www.youtube.com/embed/${encodeURIComponent(shorts[1])}`;
      }
      const embed = u.pathname.match(/^\/embed\/([^/?#]+)/);
      if (embed?.[1]) {
        return `https://www.youtube.com/embed/${encodeURIComponent(embed[1])}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function toVimeoEmbed(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, '');
    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') {
      return null;
    }
    const fromPlayer = u.pathname.match(/^\/video\/(\d+)/);
    if (fromPlayer?.[1]) {
      return `https://player.vimeo.com/video/${fromPlayer[1]}`;
    }
    const fromWatch = u.pathname.match(/^\/(\d+)/);
    if (fromWatch?.[1]) {
      return `https://player.vimeo.com/video/${fromWatch[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function parseLessonMedia(
  moduleType: string | undefined,
  content: string
): ParsedLessonMedia {
  const type = (moduleType || 'article').toLowerCase();
  if (type !== 'video') {
    return { kind: 'markdown' };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { kind: 'invalid' };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { kind: 'invalid' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { kind: 'invalid' };
  }

  const youtube = toYouTubeEmbed(trimmed);
  if (youtube) {
    return { kind: 'youtube', embedUrl: youtube };
  }

  const vimeo = toVimeoEmbed(trimmed);
  if (vimeo) {
    return { kind: 'vimeo', embedUrl: vimeo };
  }

  const path = url.pathname.toLowerCase();
  if (path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.ogg')) {
    return { kind: 'video', src: url.toString() };
  }

  return { kind: 'external', href: url.toString() };
}
