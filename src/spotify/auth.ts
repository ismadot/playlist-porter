import express from 'express';
import fetch from 'node-fetch';
import open from 'open';
import * as dotenv from 'dotenv';

dotenv.config();

const {
  CLIENT_ID_SPOTIFY,
  CLIENT_SECRET_SPOTIFY,
  REDIRECT_URI_SPOTIFY,
} = process.env;

const SCOPES = [
  'playlist-read-private',
  'user-read-email',
  'playlist-modify-private',
  'playlist-modify-public',
  'user-read-email', // opcional
  'user-read-private' // opcional

];

export async function getSpotifyAccessToken(): Promise<string> {
  const app = express();
  const port = 5173;

  return new Promise((resolve, reject) => {
    app.get('/api/auth/callback/spotify', async (req, res) => {
      const code = req.query.code as string;

      try {
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization:
              'Basic ' +
              Buffer.from(`${CLIENT_ID_SPOTIFY}:${CLIENT_SECRET_SPOTIFY}`).toString('base64'),
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI_SPOTIFY!,
          }),
        });

        const tokenData = await tokenRes.json() as { access_token: string };
        res.send('✅ ¡Autenticación con Spotify exitosa! Ya podés cerrar esta pestaña.');
        server.close();
        resolve(tokenData.access_token);
      } catch (err) {
        reject(err);
      }
    });

    const server = app.listen(port, () => {
      const authUrl = `https://accounts.spotify.com/authorize?` +
        new URLSearchParams({
          response_type: 'code',
          client_id: CLIENT_ID_SPOTIFY!,
          redirect_uri: REDIRECT_URI_SPOTIFY!,
          scope: SCOPES.join(' '),
        });

      console.log('\n🌐 Abriendo navegador para autenticar con Spotify...');
      open(authUrl);
      console.log(`🚀 Escuchando en ${REDIRECT_URI_SPOTIFY} para recibir el token...`);
    });
  });
}
