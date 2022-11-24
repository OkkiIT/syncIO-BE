export interface BasicMessage {
  roomId: string;
}

export interface PauseVideoMessage extends BasicMessage {
  currentTimePlayed: string;
}

export interface ChatMessage extends BasicMessage {
  userName: string;
  message: string;
  sendTime: string;
}

export interface SynchronizeVideoMessage extends BasicMessage {
  currentTimePlayed: string;
  sendTime: string;
}

export interface AddVideoToPlaylistMessage extends BasicMessage {
  videoLink: string;
}

export interface PlayVideoFromPlaylistMessage extends BasicMessage {
  videoId: string;
}

export interface DeleteVideoFromPlaylist extends BasicMessage {
  videoId: string;
}
