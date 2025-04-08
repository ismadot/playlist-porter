import chalk from 'chalk';
import { YouTubeTrackInfo, MatchedTrack } from 'src/google/types';
import { SpotifyTrack } from 'src/spotify/types';

export function logMatchResult(
  track: YouTubeTrackInfo,
  bestMatch: SpotifyTrack,
  score: number,
  reasons: string[]
): MatchedTrack {
  const spotifyTitle = bestMatch.name;
  const artist = bestMatch.artists.map(a => a.name).join(', ');
  const spotifyUrl = bestMatch.external_urls.spotify;

  console.log(chalk.green(`   ✅ Match con score ${score.toFixed(2)}:`));
  console.log(chalk.green(`      ${spotifyTitle} - ${artist}`));
  reasons.forEach(r => console.log(chalk.gray(`      • ${r}`)));

  return {
    youtubeTitle: track.title,
    youtubeUrl: track.youtubeUrl,
    spotifyTitle,
    spotifyUrl,
    artist,
    duration: track.duration,
    durationDifferenceMs: track.durationMs
      ? Math.abs(track.durationMs - bestMatch.duration_ms)
      : undefined,
    positionList: track.positionList,
  };
}
