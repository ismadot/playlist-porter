import { askOllama } from './askOllama';
import { isOllamaAvailable } from './checkOllamaRunning';

export type ExtractedTrackInfo = {
  artist?: string;
  title?: string;
};

export async function extractTrackInfoFromDescriptionLLM(
  description?: string,
  titleOriginal?: string,
  titleCleaned?: string
): Promise<ExtractedTrackInfo | undefined> {
  if (!description) return;

  const available = await isOllamaAvailable();
  if (!available) {
    console.warn('⚠️ Ollama no está disponible. Saltando análisis LLM...');
    return;
  }

  const prompt =  `
  Tienes información de un video musical publicado en YouTube. Tu tarea es identificar:
  
  - El nombre del artista principal o grupo
  - El título de la canción
  
  A continuación tienes el título original del video, una versión normalizada del mismo, y su descripción:
  
  🎬 Título original:
  "${titleOriginal ?? ''}"
  
  🔍 Título limpio:
  "${titleCleaned ?? ''}"
  
  📝 Descripción:
  """
  ${description ?? ''}
  """
  
  Devuelve el resultado como JSON en este formato:
  
  {
    "artist": "Nombre del artista",
    "title": "Título de la canción"
  }
  
  Si alguno de los campos no se puede detectar, devuélvelo como una cadena vacía.
  `;

  const response = await askOllama(prompt);

  try {
    const json = JSON.parse(response);
    return {
      artist: json.artist || undefined,
      title: json.title || undefined,
    };
  } catch (err) {
    console.warn('⚠️ No se pudo parsear el resultado del modelo:', response);
    return;
  }
}
