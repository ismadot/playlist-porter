// src/utils/matchScore.ts
import * as fuzz from 'fuzzball';
import { YouTubeTrackInfo } from 'src/google/types';
import { SpotifyTrack } from 'src/spotify/types';

type MatchScoreResult = {
  score: number;
  reasons: string[];
};

type MatchScoreOptions = {
  titleWeight?: number;
  artistWeight?: number;
  durationWeight?: number;
};

function average(...values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function scoreTitle(ytTitle: string, spTitle: string, reasons: string[]): number {
  const a = ytTitle.toLowerCase();
  const b = spTitle.toLowerCase();

  const score = average(
    fuzz.ratio(a, b),
    fuzz.partial_ratio(a, b),
    fuzz.token_sort_ratio(a, b),
    fuzz.token_set_ratio(a, b)
  ) / 100;

  if (score > 0.9) reasons.push('🎯 Título muy similar');
  else if (score > 0.75) reasons.push('✅ Título aceptable');
  else reasons.push('⚠️ Título poco similar');

  return score;
}

function scoreArtist(ytArtist: string | undefined, spArtists: string[], reasons: string[]): number {
  if (!ytArtist) return 0;

  const match = spArtists.some(sp => sp.toLowerCase().includes(ytArtist.toLowerCase()));
  if (match) {
    reasons.push('✅ Artista coincide');
    return 1;
  }
  return 0;
}

export function scoreDuration(
  ytMs: number | undefined,
  spMs: number,
  reasons: string[],
  boostContext?: { titleScore?: number; artistScore?: number }
): number {
  if (!ytMs) return 0;

  const diff = Math.abs(spMs - ytMs);
  const diffSec = Math.round(diff / 1000);

  const strongTextMatch =
    (boostContext?.titleScore ?? 0) > 0.85 && (boostContext?.artistScore ?? 0) > 0.5;

  if (diff < 5000) {
    reasons.push('🎯 Duración muy cercana');
    return 0;
  } else if (diff < 30000) {
    reasons.push(`⚠️ Duración diferente pero razonable (${diffSec}s)`);
    return strongTextMatch ? 0.05 : 0.1;
  } else {
    reasons.push(`❌ Duración muy diferente (${diffSec}s)`);
    return strongTextMatch ? 0.15 : 0.25;
  }
}


export function scoreMatch(
  youtube: YouTubeTrackInfo,
  spotify: SpotifyTrack,
  options?: MatchScoreOptions
): MatchScoreResult {
  const reasons: string[] = [];

  const titleScore = scoreTitle(youtube.title, spotify.name, reasons);
  const artistScore = scoreArtist(
    youtube.artistHint ?? youtube.channelTitle,
    spotify.artists.map(a => a.name),
    reasons
  );
  const durationPenalty = scoreDuration(
    youtube.durationMs,
    spotify.duration_ms,
    reasons,
    { titleScore, artistScore }
  );
  const titleWeight = options?.titleWeight ?? 1;
  const artistWeight = options?.artistWeight ?? 0.1;
  const durationWeight = options?.durationWeight ?? 1;

  let score = titleScore * titleWeight + artistScore * artistWeight - durationPenalty * durationWeight;

  return {
    score: Math.max(0, Math.min(1, score)),
    reasons,
  };
}
