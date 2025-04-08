import { google } from 'googleapis';
import * as http from 'http';
import open from 'open';
import * as url from 'url';
import * as dotenv from 'dotenv';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const REDIRECT_URI_GOOGLE = process.env.REDIRECT_URI_GOOGLE || 'http://localhost:5173/oauth2callback';

export async function getOAuth2Client() {
  const { CLIENT_ID, CLIENT_SECRET } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Faltan CLIENT_ID o CLIENT_SECRET en .env');
  }

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI_GOOGLE
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🌐 Abriendo navegador para autenticación...');
  await open(authUrl);

  const code = await listenForAuthCode(5173);
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  console.log('✅ Autenticación exitosa.\n');
  return oAuth2Client;
}

function listenForAuthCode(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const query = url.parse(req.url || '', true).query;
      const code = query.code as string;

      if (code) {
        res.end('✅ Autenticación completada. Puedes cerrar esta pestaña.');
        server.close();
        resolve(code);
      } else {
        res.end('❌ No se pudo obtener el código de autenticación.');
        reject(new Error('No se recibió el código de autenticación.'));
      }
    });

    server.listen(port, () => {
      console.log(`\n🚀 Escuchando en http://localhost:${port} para recibir el token...`);
    });
  });
}
