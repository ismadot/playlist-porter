import fetch from 'node-fetch';

import type {
  SpotifyPlaylistTracksResponse,
  SimplifiedTrack,
  SpotifyPlaylist,
  SpotifyPlaylistsResponse,
} from './types';
const {SPOTIFY_URL_API} = process.env;

export async function getSpotifyPlaylists(
  accessToken: string
): Promise<SpotifyPlaylist[]> {
  const res = await fetch(`${SPOTIFY_URL_API}/me/playlists?limit=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await res.json()) as SpotifyPlaylistsResponse;

  return data.items ?? [];
}

export async function getTracksInPlaylist(
  accessToken: string,
  playlistId: string
): Promise<SimplifiedTrack[]> {
  const res = await fetch(
    `${SPOTIFY_URL_API}/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = (await res.json()) as SpotifyPlaylistTracksResponse;

  return data.items.map((item) => {
    const track = item.track;
    return {
      title: track.name,
      description: track.album?.name ?? '',
      artist: track.artists.map((a) => a.name).join(', '),
      url: track.external_urls.spotify,
    };
  });
}
