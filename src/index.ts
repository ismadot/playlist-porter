import { Command } from 'commander';
import enquirer from 'enquirer';
import { getOAuth2Client } from './google/auth';
import { getPlaylists, getVideosInPlaylist } from './google/youtube';
import { getSpotifyAccessToken } from './spotify/auth';
import { getSpotifyPlaylists, getTracksInPlaylist } from './spotify/api';
import { exportYouTubePlaylistToJson, matchYouTubeTracksInSpotify } from './google/export';
import { createSpotifyPlaylistWithTracks } from './spotify/createPlaylist';
import fs from 'fs/promises';
import path from 'path';

const program = new Command();

program
  .name('playlist-porter')
  .description('CLI para explorar tus listas de reproducción de YouTube o Spotify')
  .version('0.1.0');

program
  .command('run')
  .description('Elige una plataforma y muestra tus listas de reproducción')
  .action(async () => {
    const { platform } = await enquirer.prompt<{ platform: 'YouTube' | 'Spotify' }>({
      type: 'select',
      name: 'platform',
      message: '¿Qué servicio querés usar?',
      choices: ['YouTube', 'Spotify'],
    });

    if (platform === 'YouTube') {
      const auth = await getOAuth2Client();
      const playlists = await getPlaylists(auth);

      if (!playlists.length) {
        console.log('No se encontraron listas de reproducción.');
        return;
      }

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

      console.log('🎯 Playlist seleccionada:', selected);
      const videos = await getVideosInPlaylist(auth, selected);

      console.log('\n🎬 Videos en la lista seleccionada:\n');
      videos.forEach((video, index) => {
        console.log(`${index + 1}. ${video.title}`);
        if (video.description) {
          console.log(`   📝 ${video.description}`);
        }
      });
    }

    if (platform === 'Spotify') {
      const token = await getSpotifyAccessToken();
      const playlists = await getSpotifyPlaylists(token);

      if (!playlists.length) {
        console.log('No se encontraron listas de reproducción.');
        return;
      }

      const choices = playlists.map(p => ({
        name: `${p.name} (ID: ${p.id})`,
        value: p.id,
      }));

      const { selected } = await enquirer.prompt<{ selected: string }>({
        type: 'select',
        name: 'selected',
        message: 'Selecciona una lista de Spotify:',
        choices,
        result(value) {
          const found = choices.find(c => c.name === value);
          return found?.value ?? value;
        },
      });

      console.log('🎯 Playlist seleccionada:', selected);
      const tracks = await getTracksInPlaylist(token, selected);

      console.log('\n🎵 Canciones en la lista seleccionada:\n');
      tracks.forEach((track, index) => {
        console.log(`${index + 1}. ${track.title}`);
        console.log(`   🎤 ${track.artist}`);
        console.log(`   💿 ${track.description}`);
        console.log(`   🔗 ${track.url}`);
      });
    }
  });

  program
  .command('export-youtube')
  .description('Exporta una playlist de YouTube como JSON para importar en Spotify')
  .action(exportYouTubePlaylistToJson);

  program
  .command('match-youtube-in-spotify <jsonFile>')
  .description('Analiza cuántas canciones de un JSON de YouTube se pueden encontrar en Spotify')
  .action(async (jsonFile) => {
    await matchYouTubeTracksInSpotify(jsonFile);
  });


  program
  .command('publish')
  .description('Publica una lista de reproducción en Spotify a partir del JSON exportado')
  .requiredOption('-i, --input <file>', 'Archivo JSON con las canciones emparejadas')
  .option('-n, --name <name>', 'Nombre de la playlist en Spotify (opcional)')
  .action(async (options) => {
    const filePath = path.resolve(options.input);
    const raw = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(raw);

    const matchedTracks = json.matchedTracks;

    if (!matchedTracks || !Array.isArray(matchedTracks)) {
      console.error('❌ El archivo no contiene un array válido de matchedTracks.');
      process.exit(1);
    }

    console.log("🚀 >> index.ts:131 >> matchedTracks:")
    const { playlistUrl } = await createSpotifyPlaylistWithTracks(matchedTracks, {
      name: options.name,
    });

    console.log('🎧 Playlist creada en Spotify:');
    console.log(playlistUrl);
  });

program.parse();
