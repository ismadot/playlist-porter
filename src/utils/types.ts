export type ChannelStats = {
  channelId: string;
  total: number;
  matched: number;
  successRate: number;
};

export type MatchConfig = {
  titleWeight: number;
  artistWeight: number;
  durationWeight: number;
  minScoreThreshold: number;
};
