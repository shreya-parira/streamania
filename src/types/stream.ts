
export interface StreamConfig {
  id: string;
  title: string;
  platform: 'youtube';
  streamId: string; // YouTube video ID
  isActive: boolean;
  isLive: boolean;
  viewerCount?: number;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamStatus {
  isLive: boolean;
  viewerCount: number;
  title: string;
  thumbnailUrl: string;
}
