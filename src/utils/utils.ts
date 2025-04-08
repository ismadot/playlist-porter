const stopWords = [
  'official', 'video', 'audio', 'lyrics', 'videoclip', 'tema', 'canción',
  'clip', 'hd', '4k', 'live', 'en vivo', 'en directo', 'feat', 'ft',
  'subtitulado', 'sub español', 'sub eng', 'sub', 'español', 'english',
  'letra', 'cover', 'explicit', 'remix', 'versión', 'version', 'original',
  'karaoke', 'instrumental', 'edit', 'extended', 'full album', 'full',
  'performance', 'official audio', 'official lyric video', 'traducción',
  'audio oficial', 'lyric video', 'vídeo oficial', 'mv', 'm v',
  'video musical', 'musica', 'track', 'bonus track', 'official track','oficial'
];

const parenthesisIgnoreList = [
  'tema oficial', 'official video', 'official audio', 'letra',
  'audio', 'video', 'lyric video', 'versión', 'subtitulado', 'sub español',
  'original', 'karaoke', 'instrumental', 'mv', 'live', 'explicit',
  'full album', 'remix', 'cover', 'performance', 'edit', 'audio oficial',
  'bonus track', 'track','hq', 'hd', '4k', 'video musical', 'musica',
  'en vivo', 'en directo', 'feat', 'ft', 'sub eng', 'sub', 'english',
  'subtitulado', 'subtitled', 'subtítulos', 'subtitles', 'traducción','outdated',
  'TEMA OFICIAL', 'OFFICIAL VIDEO', 'OFFICIAL AUDIO', 'LETRA',
];

export const defaultMatchConfig = {
  titleWeight: 1.0,
  artistWeight: 0.1,
  durationWeight: 0.25,
  minScoreThreshold: 0.5,
};


export function parseISODuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return 0;

  const [, hours, minutes, seconds] = match.map(Number);

  return (
    ((hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0)) * 1000
  );
}
export function normalizeTitle(title: string, customStopWords: string[] = []): string {
  let cleaned = title.toLowerCase();

  // 1. Analiza y decide si eliminar lo que está entre paréntesis
  cleaned = cleaned.replace(/\((.*?)\)/g, (match, content) => {
    const inner = content.trim().toLowerCase();
    return parenthesisIgnoreList.some(ignore => inner.includes(ignore)) ? '' : ` ${inner}`;
  });

  // 2. Elimina símbolos, emojis y arte ASCII, pero conserva letras (incluyendo acentos, ñ, ü, etc.)
  cleaned = cleaned
    .replace(/\[.*?\]/g, '') // elimina [entre corchetes]
    .replace(/[^\p{L}\p{N}\s]/gu, ''); // conserva letras y números, elimina símbolos raros

  // 3. Elimina stopwords
  const allStopWords = [...stopWords, ...customStopWords];
  for (const word of allStopWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  }

  return cleaned.replace(/\s+/g, ' ').trim();
}

export function extractMusicLinks(description = '') {
  const links = {
    spotify: undefined as string | undefined,
    appleMusic: undefined as string | undefined,
    deezer: undefined as string | undefined,
    other: [] as string[],
  };

  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = description.match(urlRegex) || [];

  for (const url of urls) {
    if (url.includes('open.spotify.com')) links.spotify = url;
    else if (url.includes('music.apple.com')) links.appleMusic = url;
    else if (url.includes('deezer.com')) links.deezer = url;
    else links.other.push(url);
  }

  return links;
}

export function sortByNumericKey<T extends Record<string, any>>(items: T[], key: string): T[] {
  return [...items].sort((a, b) => {
    const aVal = Number(a[key]);
    const bVal = Number(b[key]);

    if (isNaN(aVal) && isNaN(bVal)) return 0;
    if (isNaN(aVal)) return 1;
    if (isNaN(bVal)) return -1;
    return aVal - bVal;
  });
}
