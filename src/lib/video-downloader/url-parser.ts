import { VideoPlatform, VideoInfo } from './types';

// Platform-specific URL patterns
const PLATFORM_PATTERNS: Record<VideoPlatform, RegExp[]> = {
  [VideoPlatform.YOUTUBE]: [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  ],
  [VideoPlatform.TWITTER]: [
    /(?:https?:\/\/)?(?:www\.)?twitter\.com\/\w+\/status\/(\d+)/,
    /(?:https?:\/\/)?(?:www\.)?x\.com\/\w+\/status\/(\d+)/,
    /(?:https?:\/\/)?(?:mobile\.)?twitter\.com\/\w+\/status\/(\d+)/,
    /(?:https?:\/\/)?(?:mobile\.)?x\.com\/\w+\/status\/(\d+)/,
  ],
  [VideoPlatform.INSTAGRAM]: [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/reels\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
  ],
  [VideoPlatform.FACEBOOK]: [
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/watch\/\?v=(\d+)/,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/\w+\/videos\/(\d+)/,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/video\.php\?v=(\d+)/,
    /(?:https?:\/\/)?(?:www\.)?fb\.watch\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/reel\/(\d+)/,
  ],
  [VideoPlatform.LINKEDIN]: [
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/posts\/[^\/]+\/(\d+)/,
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/feed\/update\/[^\/]+\/(\d+)/,
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/video\/[^\/]+\/(\d+)/,
  ],
  [VideoPlatform.UNKNOWN]: []
};

// Common shortened URL services
const SHORTENED_URL_PATTERNS = [
  /(?:https?:\/\/)?bit\.ly\/\w+/,
  /(?:https?:\/\/)?tinyurl\.com\/\w+/,
  /(?:https?:\/\/)?goo\.gl\/\w+/,
  /(?:https?:\/\/)?t\.co\/\w+/,
  /(?:https?:\/\/)?ow\.ly\/\w+/,
  /(?:https?:\/\/)?buff\.ly\/\w+/,
];

/**
 * Detects if a URL is shortened
 */
export function isShortenedUrl(url: string): boolean {
  return SHORTENED_URL_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Detects the video platform from a URL
 */
export function detectPlatform(url: string): VideoPlatform {
  const normalizedUrl = url.trim().toLowerCase();
  
  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    if (platform === VideoPlatform.UNKNOWN) continue;
    
    for (const pattern of patterns) {
      if (pattern.test(normalizedUrl)) {
        return platform as VideoPlatform;
      }
    }
  }
  
  return VideoPlatform.UNKNOWN;
}

/**
 * Extracts video ID from a URL based on the platform
 */
export function extractVideoId(url: string, platform: VideoPlatform): string | null {
  const patterns = PLATFORM_PATTERNS[platform];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Validates a video URL
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();
  
  if (trimmedUrl.length === 0) {
    return { isValid: false, error: 'URL cannot be empty' };
  }

  // Basic URL format validation
  try {
    new URL(trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`);
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }

  // Check if it's a shortened URL (we'll need to expand it later)
  if (isShortenedUrl(trimmedUrl)) {
    return { isValid: true };
  }

  // Check if it matches any known platform
  const platform = detectPlatform(trimmedUrl);
  if (platform === VideoPlatform.UNKNOWN) {
    return { isValid: false, error: 'URL is not from a supported video platform' };
  }

  return { isValid: true };
}

/**
 * Parses a video URL and returns information about it
 */
export function parseVideoUrl(url: string): VideoInfo {
  const validation = validateUrl(url);
  
  if (!validation.isValid) {
    return {
      platform: VideoPlatform.UNKNOWN,
      url,
      isValid: false,
      error: validation.error || 'Unknown error'
    };
  }

  // Normalize URL
  const normalizedUrl = url.trim();
  const fullUrl = normalizedUrl.startsWith('http') 
    ? normalizedUrl 
    : `https://${normalizedUrl}`;

  // Check if it's shortened (we'll need to expand it in the actual implementation)
  if (isShortenedUrl(fullUrl)) {
    return {
      platform: VideoPlatform.UNKNOWN,
      url: fullUrl,
      isValid: true,
      error: 'Shortened URLs need to be expanded first'
    };
  }

  const platform = detectPlatform(fullUrl);
  const videoId = platform !== VideoPlatform.UNKNOWN 
    ? extractVideoId(fullUrl, platform) 
    : null;

  const result: VideoInfo = {
    platform,
    url: fullUrl,
    isValid: true
  };

  if (videoId) {
    result.videoId = videoId;
  }

  return result;
}

/**
 * Utility function to format platform name for display
 */
export function getPlatformDisplayName(platform: VideoPlatform): string {
  const displayNames: Record<VideoPlatform, string> = {
    [VideoPlatform.YOUTUBE]: 'YouTube',
    [VideoPlatform.TWITTER]: 'Twitter/X',
    [VideoPlatform.INSTAGRAM]: 'Instagram',
    [VideoPlatform.FACEBOOK]: 'Facebook',
    [VideoPlatform.LINKEDIN]: 'LinkedIn',
    [VideoPlatform.UNKNOWN]: 'Unknown'
  };
  
  return displayNames[platform] || 'Unknown';
} 