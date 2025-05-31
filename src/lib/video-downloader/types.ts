export enum VideoPlatform {
  YOUTUBE = 'youtube',
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  UNKNOWN = 'unknown'
}

/**
 * Represents the quality of a video.
 * The string values are for display or matching, not necessarily for direct sorting.
 * Order can be inferred or defined in mapping functions.
 */
export enum VideoQuality {
  Q_240P = '240p',
  LOW = '360p',
  MEDIUM = '480p',
  HIGH = '720p', // HD
  FULL_HD = '1080p',
  Q_1440P = '1440p', // 2K
  ULTRA_HD = '2160p', // 4K
  BEST = 'best', // Represents the best available if specific qualities aren't parsed
  WORST = 'worst', // Represents the worst available
}

// Renamed from VideoFormat to avoid confusion with yt-dlp format objects that might also be called 'format'
export enum VideoFormatType {
  MP4 = 'mp4',
  WEBM = 'webm',
  AVI = 'avi',
  MOV = 'mov',
  // Add other formats as needed
}

/**
 * Detailed information about a specific video/audio format available from the platform.
 * This is intended to store data directly from yt-dlp's format objects or similar sources.
 */
export interface VideoPlatformFormat {
  itag?: string; // Platform-specific identifier for the format (e.g., YouTube's itag)
  url: string; // Direct URL to the media stream
  mimeType?: string; // e.g., 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
  width?: number;
  height?: number;
  bitrate?: number; // Approximate bitrate in kbit/s or bits/s (total bitrate from yt-dlp is tbr)
  qualityLabel?: string; // e.g., '720p', 'medium', ' DASH video' (from format_note)
  fps?: number;
  audioBitrate?: number; // Audio bitrate in kbit/s, if available separately (e.g. abr from yt-dlp)
  // Add any other relevant fields from yt-dlp like 'ext', 'vcodec', 'acodec', 'format_id'
  ext?: string; // file extension (e.g. 'mp4')
  vcodec?: string; // video codec name (e.g. 'avc1')
  acodec?: string; // audio codec name (e.g. 'mp4a.40.2')
  format_id?: string; // yt-dlp specific format id
}

/**
 * Standardized video metadata structure after processing platform-specific info.
 */
export interface VideoMetadata {
  platform: VideoPlatform;
  id: string; // Platform-specific video ID (e.g., tweetId, YouTube videoId)
  title: string;
  duration: number; // in seconds
  thumbnailUrl?: string;
  author?: string;
  uploadDate?: string; // Consider string for flexibility (e.g. "YYYYMMDD" from yt-dlp), can be parsed if needed
  qualities: VideoQuality[]; // Array of available standardized video qualities
  formats: VideoPlatformFormat[]; // Array of detailed platform-specific formats
  error?: string; // To store error messages if metadata fetching failed for this specific video
  // Any other platform-agnostic fields can be added here
}

/**
 * Represents initial, often brief, information about a video URL,
 * typically used for quick validation before fetching full metadata.
 */
export interface VideoInfo {
  platform: VideoPlatform;
  url: string; // The original URL provided
  videoId?: string; // Extracted video ID, if applicable
  isValid: boolean; // Whether the URL points to a seemingly valid video
  error?: string; // Error message if validation failed
}

/**
 * Options for downloading a video.
 */
export interface VideoDownloadOptions {
  quality?: VideoQuality; // User's desired standardized quality
  format?: VideoFormatType; // User's desired container format (e.g., MP4)
  // Users might also specify a direct VideoPlatformFormat.itag or format_id if they want a very specific stream
  platformFormatId?: string;
}

/**
 * Progress information for a download operation.
 */
export interface DownloadProgress {
  percent: number; // Percentage completion (0-100)
  downloaded: number; // Bytes downloaded so far
  total: number; // Total bytes to download
  speed?: number; // Download speed in bytes per second
  eta?: string; // Estimated time remaining (e.g., "01:23" formatted string)
}

/**
 * Result of a download operation.
 */
export interface DownloadResult {
  success: boolean;
  filePath?: string; // Path to the downloaded file if saved locally
  // If not saving locally, or if the library provides a direct URL after processing:
  videoUrl?: string;
  metadata?: VideoMetadata; // Metadata of the video that was downloaded
  error?: string; // Error message if the download failed
}