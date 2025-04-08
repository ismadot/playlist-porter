import fs from 'fs/promises';
import path from 'path';
import { getOAuth2Client } from './auth';
import { getPlaylists, getVideosInPlaylist } from './youtube';
import enquirer from 'enquirer';
import { getSpotifyAccessToken } from 'src/spotify/auth';
import chalk from 'chalk';
import { FailedMatch, MatchedTrack, MatchSummary, YouTubeTrackInfo } from './types';
import { defaultMatchConfig, extractMusicLinks, normalizeTitle, parseISODuration, sortByNumericKey } from 'src/utils/utils';
import { buildChannelStats } from 'src/utils/channelStats';
import { retryMatchWithLLM } from './retryWithLLM';
import { fetchSpotifyCandidates } from 'src/services/spotifySearch';
import { findBestMatch } from 'src/services/candidateMatcher';
import { logMatchResult } from 'src/services/logMatchResult';
import { buildFailedMatch } from 'src/services/buildFailedMatch';

export async function exportYouTubePlaylistToJson() {
  const auth = await getOAuth2Client();
  const playlists = await getPlaylists(auth);

  const choices = playlists
    .filter(p => !!p.id && !!p.snippet?.title)
    .map(p => ({
      name: `${p.snippet!.title} (ID: ${p.id})`,
      value: p.id!,
    }));

  const { selected } = await enquirer.prompt<{ selected: string }>({
    type: 'select',
    name: 'selected',
    message: 'Selecciona una lista de YouTube:',
    choices,
    result(value) {
      const found = choices.find(c => c.name === value);
      return found?.value ?? value;
    },
  });

  const videos = await getVideosInPlaylist(auth, selected);

  const result: YouTubeTrackInfo[] = videos.map(v => ({
    title: v.title,
    description: v.description,
    channelTitle: v.channelTitle,
    positionList: v.positionList,
    channelId: v.channelId,
    youtubeUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
    videoId: v.videoId,
    duration: v.duration, // ISO string (PT3M20S)
    durationMs: v.duration ? parseISODuration(v.duration) : undefined, // 200000
    detectedLinks: extractMusicLinks(v.description),
  }));

  const outputPath = path.resolve(`playlist-youtube-${Date.now()}.json`);
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(chalk.green(`✅ Playlist exportada como JSON en: ${outputPath}`));
}

export async function matchYouTubeTracksInSpotify(jsonPath: string): Promise<MatchSummary> {
  const accessToken = await getSpotifyAccessToken();

  const file = await fs.readFile(path.resolve(jsonPath), 'utf-8');
  const tracks: YouTubeTrackInfo[] = JSON.parse(file);

  let matched = 0;
  let notFoundTitles: FailedMatch[] = [];
  const matchedTracks: MatchedTrack[] = [];
  const channelStats = buildChannelStats(tracks, matchedTracks);

  console.log(chalk.blueBright(`\n🔎 Buscando ${tracks.length} canciones en Spotify...\n`));

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const queryRaw = normalizeTitle(track.title);
    const query = encodeURIComponent(queryRaw);
    console.log(chalk.cyan(`[${i + 1}/${tracks.length}] Buscando: "${track.title}" → "${queryRaw}"`));

    try {
      const candidates = await fetchSpotifyCandidates(query, accessToken);

      const { bestMatch, bestScore, reasons:matchReasons } = findBestMatch(track, candidates, defaultMatchConfig);

      const channelId = track.channelId;
      let channelBoost = 0;

      if (channelId && channelStats[channelId]?.successRate > 0.7) {
        channelBoost = 0.05;
        matchReasons.push('📣 Match reforzado por historial del canal');
      }

      const finalScore = bestScore + channelBoost;

      if (bestMatch && finalScore >= defaultMatchConfig.minScoreThreshold) {
        matched++;
        const match = logMatchResult(track, bestMatch, finalScore, matchReasons);
        matchedTracks.push(match);
      } else {
        const failed = buildFailedMatch(track, queryRaw, candidates, defaultMatchConfig);
        notFoundTitles.push(failed);
        console.log(chalk.yellow(`❌ No se encontró un buen match (score: ${bestScore.toFixed(2)})`));
      }

    } catch (err) {
      console.error(chalk.red(`⚠️ Error al buscar "${track.title}":`), err);
      notFoundTitles.push({
        youtubeTitle: track.title,
        youtubeUrl: track.youtubeUrl,
        searchQuery: queryRaw,
        positionList: track.positionList,
      });
    }
  }

  const retryResult = await retryMatchWithLLM(
    notFoundTitles,
    tracks,
    matchedTracks,
    accessToken,
    defaultMatchConfig
  );
  chalk.yellow(`❌ No encontradas: ${notFoundTitles.length}`)
  matched += retryResult.matchedCount;
  notFoundTitles = retryResult.notFoundTitles;

  const result: MatchSummary = {
    total: tracks.length,
    matched,
    notMatched: tracks.length - matched,
    notFoundTitles,
    matchedTracks:sortByNumericKey<MatchedTrack>(matchedTracks, 'positionList')
  };

  const outputPath = path.resolve(`match-results-${Date.now()}.json`);
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(chalk.bold('\n📊 Resultado del análisis:'));
  console.log(
    chalk.magentaBright(`🎧 Total: ${result.total}`),
    chalk.green(`🎯 Coincidencias: ${result.matched}`),
    chalk.yellow(`❌ No encontradas: ${result.notMatched}`)
  );
  console.log(chalk.green(`\n📝 Resultados exportados a: ${path.relative(process.cwd(), outputPath)}`));

  return result;
}

