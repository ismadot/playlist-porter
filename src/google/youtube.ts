import { google, youtube_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { VideoInfo } from './types';
import { GaxiosResponse } from 'gaxios';


export async function getVideosInPlaylist(
  auth: OAuth2Client,
  playlistId: string
): Promise<VideoInfo[]> {
  const youtube = google.youtube({ version: 'v3', auth });

  const videoMap: Map<string, Omit<VideoInfo, 'duration'>> = new Map();
  const videoIds: string[] = [];
  let nextPageToken: string | undefined = undefined;

  do {
    const res: GaxiosResponse<youtube_v3.Schema$PlaylistItemListResponse>  = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId,
      maxResults: 50,
      pageToken: nextPageToken,
    });


    const data = res.data;
    const items = data.items ?? [];

    for (const item of items) {
      const snippet = item.snippet;
      const videoId = snippet?.resourceId?.videoId;
      if (videoId && snippet?.title) {
        videoIds.push(videoId);
        videoMap.set(videoId, {
          title: snippet.title,
          description: snippet.description,
          channelTitle: snippet.videoOwnerChannelTitle,
          channelId: snippet.videoOwnerChannelId,
          position: snippet.position,
          videoId,
        });
      }
    }

    nextPageToken = res.data.nextPageToken ?? undefined;
  } while (nextPageToken);

  // Ahora consultamos detalles del video para obtener duración
  const videos: VideoInfo[] = [];

  const chunkSize = 50; // YouTube API permite hasta 50 por request
  for (let i = 0; i < videoIds.length; i += chunkSize) {
    const chunk = videoIds.slice(i, i + chunkSize);
    const res = await youtube.videos.list({
      part: ['contentDetails'],
      id: chunk,
    });

    const items = res.data.items ?? [];
    for (const item of items) {
      const id = item.id!;
      const duration = item.contentDetails?.duration;

      const base = videoMap.get(id);
      if (base) {
        videos.push({
          title: base.title,
          videoId: base.videoId,
          description: base.description,
          channelTitle: base.channelTitle,
          positionList: base.position,
          channelId: base?.channelId,
          channelUrl: base?.channelId
            ? `https://www.youtube.com/channel/${base.channelId}`
            : undefined,
          duration: duration ?? undefined,
        });
      }
    }
  }

  return videos;
}

export async function getPlaylists(
  auth: OAuth2Client
): Promise<youtube_v3.Schema$Playlist[]> {
  const youtube = google.youtube({ version: 'v3', auth });

  const res = await youtube.playlists.list({
    part: ['snippet'],
    mine: true,
    maxResults: 50,
  });

  const data: youtube_v3.Schema$PlaylistListResponse = res.data;

  return data.items ?? [];
}

