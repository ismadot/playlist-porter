import { extractArtistFromDescriptionLLM } from '../extractArtist';

const description = `
Tema original escrito por Juan Pérez.
Guitarra y voz: Juan Pérez
Producido por Música Libre 2024.
`;

(async () => {
  const artist = await extractArtistFromDescriptionLLM(description);
  console.log('🎤 Artista detectado:', artist);
})();
