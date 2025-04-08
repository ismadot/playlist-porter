
import { extractTrackInfoFromDescriptionLLM } from '../extractTrackInfoFromDescription';

const description = `
Videoclip oficial de la canción "Nunca, Siempre"
Letra y voz por Ramsés Meneses (McKlopedia)
Producción de beat por El Arkeólogo.
`;

(async () => {
  const info = await extractTrackInfoFromDescriptionLLM(description);
  console.log('🎤 Artista:', info?.artist);
  console.log('🎵 Título:', info?.title);
})();
