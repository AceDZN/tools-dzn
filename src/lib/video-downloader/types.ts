export enum VideoPlatform {
  YOUTUBE = 'youtube',
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  UNKNOWN = 'unknown'
}

export interface VideoInfo {
  platform: VideoPlatform;
  url: string;
  videoId?: string;
  isValid: boolean;
  error?: string;
}

export interface VideoDownloadOptions {
  quality?: VideoQuality;
  format?: VideoFormat;
}

export enum VideoQuality {
  LOW = '360p',
  MEDIUM = '480p',
  HIGH = '720p',
  FULL_HD = '1080p',
  ULTRA_HD = '2160p',
  BEST = 'best',
  WORST = 'worst'
}

export enum VideoFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  AVI = 'avi',
  MOV = 'mov'
}

export interface VideoMetadata {
  title?: string;
  duration?: number; // in seconds
  thumbnail?: string;
  author?: string;
  uploadDate?: Date;
  availableQualities?: VideoQuality[];
}

export interface DownloadProgress {
  percent: number;
  downloaded: number;
  total: number;
  speed?: number; // bytes per second
}

export interface DownloadResult {
  success: boolean;
  videoUrl?: string;
  metadata?: VideoMetadata;
  error?: string;
} 