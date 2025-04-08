
export type YouTubeTrackInfo = {
  title: string;
  description?: string;
  channelTitle?: string;
  videoId: string;
  channelId?: string;
  channelUrl?: string;
  channelName?: string;
  youtubeUrl?: string;
  duration?: string; // ISO 8601
  durationMs?: number
  artistHint?: string;
  titleHint?: string;
  positionList: number;
  detectedLinks?: {
    spotify?: string;
    appleMusic?: string;
    deezer?: string;
    other?: string[];
  };
};

export type MatchedTrack = {
  youtubeTitle: string;
  youtubeUrl?: string;
  spotifyTitle: string;
  spotifyUrl: string;
  artist: string;
  duration?: string;
  durationDifferenceMs?: number;
  positionList: number;
};

export type MatchSummary = {
  total: number;
  matched: number;
  notMatched: number;
  notFoundTitles: FailedMatch[];
  matchedTracks: MatchedTrack[];
};
export type VideoInfo = {
  [x: string]: any;
  positionList: number;
  title: string;
  description?: string;
  channelTitle?: string;
  channelId?: string;
  channelUrl?: string;
  videoId: string;
  duration?: string; // ISO 8601 format
};

export type FailedMatch = {
  youtubeTitle: string;
  youtubeUrl?: string;
  searchQuery: string;
  durationMs?: number;
  positionList: number;
  candidates?: {
    spotifyTitle: string;
    artist: string;
    score: number;
    durationMs?: number;
    durationDifferenceMs?: number;
    url: string;
    reasons: string[];
  }[];
};
