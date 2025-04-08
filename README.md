# 🎧 playlist-porter (YouTube → Spotify Playlist Matcher)

**playlist-porter** es una herramienta CLI que permite extraer listas de reproducción de YouTube, emparejar sus canciones con resultados en Spotify y exportarlas como nuevas playlists en tu cuenta de Spotify.

---

## 🚀 Características

- ✅ Autenticación OAuth con YouTube y Spotify  
- 🎵 Extracción detallada de videos, duración y metadatos  
- 🤖 Matching avanzado usando heurísticas + modelo de lenguaje local (Ollama)  
- 🧠 Retry inteligente solo en casos fallidos con LLM  
- 📤 Publicación automática como playlist privada en tu cuenta de Spotify  
- 📁 Resultados exportables para análisis y debugging  

---

## 📦 Instalación

```bash
git clone https://github.com/tu-usuario/playlist-porter.git
cd playlist-porter
pnpm install
```

---

## 🛠 Requisitos

- Node.js >= 20.x  
- [Ollama](https://ollama.com/) instalado (opcional, para mejora con LLM)  
- Credenciales OAuth configuradas para:
  - YouTube Data API
  - Spotify Web API

---

## ✨ Uso

### 1. Extraer una playlist de YouTube

```bash
pnpm dev run
```

Selecciona una playlist. Se exportará un JSON con los videos (`playlist-youtube-*.json`).

---

### 2. Emparejar con Spotify

```bash
pnpm dev match --input playlist-youtube-*.json
```

Crea un archivo `match-results-*.json` con las canciones encontradas y no encontradas.

---

### 3. Publicar como playlist en Spotify

```bash
pnpm dev publish --input match-results-*.json --name "Mi Playlist de Spotify"
```

🟢 Se creará una nueva playlist privada en tu cuenta de Spotify con las canciones emparejadas.

---

## ⚙️ Estructura del proyecto

```
src/
├── google/           # Lógica de YouTube
├── spotify/          # API Spotify
├── apiOllama/        # Extracción inteligente con LLM
├── services/         # Utilidades desacopladas (scoring, logging, etc.)
├── utils/            # Funciones comunes y helpers
```

---

## 💡 Roadmap

- [ ] Soporte para importar playlists públicas de terceros  
- [ ] Match parcial y sugerencias interactivas  
- [ ] Soporte para Apple Music o Deezer (futuro)  

---

## 🧠 Créditos y herramientas usadas

- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)  
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)  
- [Ollama](https://ollama.com/) + [Mistral](https://mistral.ai/)  
- [fuzzball.js](https://www.npmjs.com/package/fuzzball) para matching textual  

---

## 📜 Licencia

MIT License. Hecho con ❤️ por [tu nombre o GitHub handle].
