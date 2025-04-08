import { YouTubeTrackInfo } from 'src/google/types';
import { MatchedTrack } from 'src/google/types';
import { ChannelStats } from './types';

export function buildChannelStats(
  allTracks: YouTubeTrackInfo[],
  matchedTracks: MatchedTrack[]
): Record<string, ChannelStats> {
  const stats: Record<string, ChannelStats> = {};

  for (const track of allTracks) {
    if (!track.channelId) continue;

    if (!stats[track.channelId]) {
      stats[track.channelId] = {
        channelId: track.channelId,
        total: 0,
        matched: 0,
        successRate: 0,
      };
    }

    stats[track.channelId].total++;
  }

  for (const match of matchedTracks) {
    const found = allTracks.find(t => t.title === match.youtubeTitle);
    if (found?.channelId && stats[found.channelId]) {
      stats[found.channelId].matched++;
    }
  }

  for (const id in stats) {
    const s = stats[id];
    s.successRate = s.total > 0 ? s.matched / s.total : 0;
  }

  return stats;
}
