import { FailedMatch, YouTubeTrackInfo } from 'src/google/types';
import { SpotifyTrack } from 'src/spotify/types';
import { scoreMatch } from 'src/utils/matchScore';
import { MatchConfig } from 'src/utils/types';

export function buildFailedMatch(
  track: YouTubeTrackInfo,
  queryRaw: string,
  candidates: SpotifyTrack[],
  config: MatchConfig
): FailedMatch {
  return {
    youtubeTitle: track.title,
    youtubeUrl: track.youtubeUrl,
    searchQuery: queryRaw,
    durationMs: track.durationMs,
    positionList: track.positionList,
    candidates: candidates.map(candidate => {
      const match = scoreMatch(track, candidate, config);
      return {
        spotifyTitle: candidate.name,
        artist: candidate.artists.map(a => a.name).join(', '),
        score: match.score,
        reasons: match.reasons,
        durationMs: candidate.duration_ms,
        durationDifferenceMs: track.durationMs
          ? Math.abs(track.durationMs - candidate.duration_ms)
          : undefined,
        url: candidate.external_urls.spotify,
      };
    }),
  };
}
