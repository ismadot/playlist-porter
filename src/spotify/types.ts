export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: {
    total: number;
  };
  owner: {
    display_name: string;
    id: string;
  };
}

export interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
}

export type SimplifiedTrack = {
  title: string;
  description: string;
  artist: string;
  url: string;
};

export interface SpotifyTrackItem {
  track: {
    id: string;
    name: string;
    artists: {
      name: string;
    }[];
    album: {
      name: string;
    };
    external_urls: {
      spotify: string;
    };
  };
}

export interface SpotifyPlaylistTracksResponse {
  items: SpotifyTrackItem[];
  total: number;
  limit: number;
  offset: number;
}

// ✅ CORREGIDO: definición de búsqueda de tracks
export type SpotifyTrack = {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: {
    name: string;
  }[];
  external_urls: {
    spotify: string;
  };
};

export type SpotifySearchResponse = {
  tracks?: {
    items?: SpotifyTrack[];
  };
};
