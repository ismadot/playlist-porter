import fetch from 'node-fetch';
import chalk from 'chalk';
import { normalizeTitle } from 'src/utils/utils';
import { scoreMatch } from 'src/utils/matchScore';
import { extractTrackInfoFromDescriptionLLM } from 'src/apiOllama/extractTrackInfoFromDescription';
import { SpotifySearchResponse, SpotifyTrack } from 'src/spotify/types';
import {
  YouTubeTrackInfo,
  MatchedTrack,
  FailedMatch,
} from './types';
import { MatchConfig } from 'src/utils/types';

export async function retryMatchWithLLM(
  failedTracks: FailedMatch[],
  allTracks: YouTubeTrackInfo[],
  matchedTracks: MatchedTrack[],
  accessToken: string,
  matchConfig: MatchConfig
): Promise<{
  matchedCount: number;
  notFoundTitles: FailedMatch[];
}> {
  console.log(chalk.blueBright('\n🔁 Segundo intento con LLM para casos no encontrados...\n'));
  const {SPOTIFY_URL_API} = process.env;
  let matchedCount = 0;
  const stillNotFound: FailedMatch[] = [];

  for (const failed of failedTracks) {
    const originalTrack = allTracks.find(t => t.youtubeUrl === failed.youtubeUrl);
    if (!originalTrack) continue;

    const extracted = await extractTrackInfoFromDescriptionLLM(
      originalTrack.description,
      originalTrack.title,
      normalizeTitle(originalTrack.title)
    );

    if (!extracted?.artist && !extracted?.title) {
      stillNotFound.push(failed);
      continue;
    }

    const enrichedTrack: YouTubeTrackInfo = {
      ...originalTrack,
      artistHint: extracted.artist ?? originalTrack.artistHint,
      titleHint: extracted.title ?? originalTrack.title,
    };

    const rawTitle = enrichedTrack.titleHint ?? enrichedTrack.title;
    const queryRaw = normalizeTitle(rawTitle);
    const query = encodeURIComponent(queryRaw);

    console.log(chalk.cyan(`🎯 Reintentando: "${enrichedTrack.title}" → "${queryRaw}"`));

    try {
      const res = await fetch(
        `${SPOTIFY_URL_API}/search?q=${query}&type=track&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = (await res.json()) as SpotifySearchResponse;
      const candidates: SpotifyTrack[] = data.tracks?.items ?? [];

      let bestMatch: SpotifyTrack | undefined;
      let bestScore = 0;
      let matchReasons: string[] = [];

      for (const candidate of candidates) {
        const result = scoreMatch(enrichedTrack, candidate, matchConfig);
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMatch = candidate;
          matchReasons = result.reasons;
        }
      }

      const finalScore = bestScore;

      if (bestMatch && finalScore >= matchConfig.minScoreThreshold) {
        matchedCount++;
        const spotifyTitle = bestMatch.name;
        const artist = bestMatch.artists.map(a => a.name).join(', ');
        const spotifyUrl = bestMatch.external_urls.spotify;

        matchedTracks.push({
          youtubeTitle: enrichedTrack.title,
          youtubeUrl: enrichedTrack.youtubeUrl,
          spotifyTitle,
          spotifyUrl,
          artist,
          duration: enrichedTrack.duration,
          durationDifferenceMs: enrichedTrack.durationMs
            ? Math.abs(enrichedTrack.durationMs - bestMatch.duration_ms)
            : undefined,
          positionList: enrichedTrack.positionList,
        });

        console.log(chalk.green(`   ✅ Match con LLM: ${spotifyTitle} - ${artist} (score: ${finalScore.toFixed(2)})`));
        matchReasons.forEach(r => console.log(chalk.gray(`   • ${r}`)));
      } else {
        stillNotFound.push(failed);
        console.log(chalk.yellow(`   ❌ No se logró match con LLM (score: ${bestScore.toFixed(2)})`));
      }

    } catch (err) {
      stillNotFound.push(failed);
      console.error(chalk.red(`⚠️ Error en retry LLM: ${enrichedTrack.title}`), err);
    }
  }
  if (matchedCount > 0) {
    console.log(
      chalk.cyanBright(`\n🧠 El retry con LLM logró emparejar ${matchedCount} canciones adicionales.`)
    );
  }
  return {
    matchedCount,
    notFoundTitles: stillNotFound,
  };
}
