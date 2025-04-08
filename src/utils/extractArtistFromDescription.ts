export function extractArtistFromDescription(description?: string): string | undefined {
  if (!description) return;

  const lower = description.toLowerCase();
  const artistMarkers = ['artista:', 'interpretado por:', 'por:', 'autor:', 'voz:'];

  for (const marker of artistMarkers) {
    const index = lower.indexOf(marker);
    if (index !== -1) {
      const line = lower.substring(index + marker.length).split('\n')[0].trim();
      return line.replace(/[^a-záéíóúüñ0-9\s]/gi, '').split(' ')[0]; // Devuelve el primer nombre por ahora
    }
  }

  return;
}
