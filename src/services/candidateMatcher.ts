import { scoreMatch } from '../utils/matchScore';
import { SpotifyTrack } from '../spotify/types';
import { YouTubeTrackInfo } from '../google/types';
import { MatchConfig } from '../utils/types';

export function findBestMatch(track: YouTubeTrackInfo, candidates: SpotifyTrack[], config: MatchConfig) {
  let bestScore = 0;
  let bestMatch: SpotifyTrack | undefined;
  let reasons: string[] = [];

  for (const candidate of candidates) {
    const artistHint = track.artistHint; // extraído previamente
    const result = scoreMatch({ ...track, artistHint }, candidate, config);
    if (result.score > bestScore) {
      bestScore = result.score;
      bestMatch = candidate;
      reasons = result.reasons;
    }
  }

  return { bestMatch, bestScore, reasons };
}
