import fetch from 'node-fetch';
import chalk from 'chalk';
import { getSpotifyAccessToken } from './auth';
import { MatchedTrack } from 'src/google/types';
const {SPOTIFY_URL_API} = process.env;

export async function createSpotifyPlaylistWithTracks(
  matchedTracks: MatchedTrack[],
  options?: { name?: string }
): Promise<{ playlistUrl: string }> {
  const accessToken = await getSpotifyAccessToken();
  console.log("🚀 >> createPlaylist.ts:11 >> accessToken:")

  console.log(chalk.blue(`🔐 Obteniendo ID del usuario de Spotify...`));
  const userRes = await fetch(`${SPOTIFY_URL_API}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const userText = await userRes.text();
  console.log(chalk.gray(`📥 Respuesta /me: ${userText}`));

  const user = JSON.parse(userText) as { id: string };
  const userId = user.id;
  console.log(chalk.green(`👤 Usuario autenticado: ${userId}`));

  const playlistName = options?.name ?? 'Playlist generada desde YouTube';
  console.log(chalk.blue(`🎼 Creando nueva playlist: "${playlistName}"...`));

  const playlistRes = await fetch(`${SPOTIFY_URL_API}/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: playlistName,
      description: 'Generado automáticamente desde playlist-porter 🎵',
      public: false,
    }),
  });

  const playlistText = await playlistRes.text();
  console.log(chalk.gray(`📥 Respuesta creación de playlist: ${playlistText}`));

  const playlist = JSON.parse(playlistText) as { id: string; external_urls?: { spotify: string } };

  if (!playlist.id || !playlist.external_urls?.spotify) {
    console.error('❌ No se pudo crear la playlist. Respuesta recibida:', playlist);
    throw new Error('La creación de la playlist falló. Verifica tus credenciales o permisos.');
  }

  const playlistId = playlist.id;

  const uris = matchedTracks
    .map(track => track.spotifyUrl?.split('/track/')[1])
    .filter(Boolean)
    .map(id => `spotify:track:${id}`);

  console.log(chalk.blue(`➕ Agregando ${uris.length} canciones a la playlist...`));

  for (let i = 0; i < uris.length; i += 100) {
    const batch = uris.slice(i, i + 100);
    const addRes = await fetch(`${SPOTIFY_URL_API}/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: batch }),
    });

    const addText = await addRes.text();
    if (!addRes.ok) {
      console.error(chalk.red(`⚠️ Error al agregar canciones (bloque ${i}):`), addText);
    } else {
      console.log(chalk.green(`✅ Canciones agregadas (bloque ${i + 1}): OK`));
    }
  }

  console.log(chalk.green(`🎉 Playlist creada con éxito: ${playlist.external_urls.spotify}`));

  return { playlistUrl: playlist.external_urls.spotify };
}
