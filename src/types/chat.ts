
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  isDeleted?: boolean;
  streamId?: string;
}

export interface ChatModerationAction {
  id: string;
  userId: string;
  username: string;
  actionType: 'mute' | 'ban' | 'warning' | 'unmute' | 'unban';
  reason: string;
  duration?: number; // in minutes, for temporary actions
  moderatorId: string;
  moderatorUsername: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ChatSettings {
  slowMode: boolean;
  slowModeDelay: number; // seconds between messages
  bannedKeywords: string[];
  autoDeleteKeywords: string[];
}

export interface UserModerationStatus {
  userId: string;
  username: string;
  isMuted: boolean;
  isBanned: boolean;
  muteExpiresAt?: Date;
  lastMessageAt?: Date;
}
