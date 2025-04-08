import fetch from 'node-fetch';
import { SpotifySearchResponse, SpotifyTrack } from '../spotify/types';
const {SPOTIFY_URL_API} = process.env;

export async function fetchSpotifyCandidates(query: string, token: string): Promise<SpotifyTrack[]> {
  const res = await fetch(
    `${SPOTIFY_URL_API}/search?q=${query}&type=track&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = (await res.json()) as SpotifySearchResponse;
  return data.tracks?.items ?? [];
}
