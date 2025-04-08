import { askOllama } from './askOllama';
import { isOllamaAvailable } from './checkOllamaRunning';

export async function extractArtistFromDescriptionLLM(description?: string): Promise<string | undefined> {
  if (!description) return;

  const available = await isOllamaAvailable();
  if (!available) {
    console.warn('⚠️ Ollama no está disponible. Saltando análisis LLM...');
    return;
  }

  const prompt = `
Dado este texto de descripción de un video de YouTube:

"""${description}"""

Extrae solo el nombre del artista o intérprete principal. 
Si no estás seguro o no hay un artista claro, responde simplemente con "Ninguno".
  `;

  const response = await askOllama(prompt);
  return response.toLowerCase().includes("ninguno") ? undefined : response;
}
