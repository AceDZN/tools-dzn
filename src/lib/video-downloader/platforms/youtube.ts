import { Innertube, UniversalCache } from 'youtubei.js';
import { 
  VideoMetadata, 
  DownloadResult, 
  VideoQuality, 
  VideoFormat,
  VideoDownloadOptions 
} from '../types';

// Initialize YouTube client with caching
let youtube: Innertube | null = null;

async function getYouTubeClient(): Promise<Innertube> {
  if (!youtube) {
    youtube = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
  }
  return youtube;
}

/**
 * Maps our VideoQuality enum to youtubei.js quality itags
 */

/**
 * Extracts YouTube video metadata
 */
export async function getYouTubeVideoInfo(videoId: string): Promise<VideoMetadata> {
  let video;
  try {
    const yt = await getYouTubeClient();
    video = await yt.getInfo(videoId);
  } catch (error: any) {
    // Attempt to interpret youtubei.js errors
    // This is speculative as youtubei.js error specifics might vary.
    // Common issues are video not found, private, or unavailable.
    console.error(`youtubei.js error for videoId ${videoId}:`, error.message);
    if (error.message?.includes('private') || error.message?.includes('unavailable') || error.message?.includes('removed')) {
      throw new Error('Video is private or unavailable.');
    }
    if (error.message?.includes('not found') || error.message?.includes('Invalid video id')) {
      throw new Error('Video not found.');
    }
    // Fallback for other youtubei.js errors
    throw new Error(`Failed to fetch video data from YouTube: ${error.message || 'Unknown error'}`);
  }

  if (!video) {
    // This case should ideally be caught by the try-catch above, but as a safeguard:
    throw new Error('Failed to retrieve video information from YouTube.');
  }

  const basicInfo = video.basic_info;

  if (!basicInfo) {
    throw new Error('Could not retrieve basic video information.');
  }
    
  // Get available qualities
    const qualities = new Set<VideoQuality>();

    const qualityOrder: Record<VideoQuality, number> = {
      [VideoQuality.Q_240P]: 0,
      [VideoQuality.LOW]: 1, // 360p
      [VideoQuality.MEDIUM]: 2, // 480p
      [VideoQuality.HIGH]: 3, // 720p
      [VideoQuality.FULL_HD]: 4, // 1080p
      [VideoQuality.Q_1440P]: 5, // 1440p
      [VideoQuality.ULTRA_HD]: 6, // 2160p
      // BEST and WORST are not typically listed as specific resolutions
      [VideoQuality.BEST]: 98,
      [VideoQuality.WORST]: -1
    };

    const addQuality = (height?: number, qualityLabel?: string) => {
      if (qualityLabel?.includes('2160p') || height === 2160) qualities.add(VideoQuality.ULTRA_HD);
      else if (qualityLabel?.includes('1440p') || height === 1440) qualities.add(VideoQuality.Q_1440P);
      else if (qualityLabel?.includes('1080p') || height === 1080) qualities.add(VideoQuality.FULL_HD);
      else if (qualityLabel?.includes('720p') || height === 720) qualities.add(VideoQuality.HIGH);
      else if (qualityLabel?.includes('480p') || height === 480) qualities.add(VideoQuality.MEDIUM);
      else if (qualityLabel?.includes('360p') || height === 360) qualities.add(VideoQuality.LOW);
      else if (qualityLabel?.includes('240p') || height === 240) qualities.add(VideoQuality.Q_240P);
    };

    // Process muxed streams
    video.streaming_data?.formats.forEach(format => {
      addQuality(format.height, format.quality_label);
    });

    // Process adaptive streams (video-only)
    video.streaming_data?.adaptive_formats.forEach(format => {
      if (format.mime_type?.includes('video')) { // Ensure it's a video format
        addQuality(format.height, format.quality_label);
      }
    });

    const sortedQualities = Array.from(qualities).sort((a, b) => {
      return (qualityOrder[a] ?? 99) - (qualityOrder[b] ?? 99);
    });

    // Ensure required fields are not undefined
    if (!basicInfo.title) {
      // This might indicate a bigger issue with the data retrieved or a restricted video
      throw new Error('Video title is missing. The video might be restricted or unavailable.');
    }

    return {
      title: basicInfo.title,
      duration: basicInfo.duration || 0,
      thumbnail: basicInfo.thumbnail?.[0]?.url,
      author: basicInfo.author || 'Unknown',
      uploadDate: undefined, // Remove publish_date as it's not available in basic_info
      availableQualities: sortedQualities
    };
  // The outer try-catch is removed as specific errors are thrown from within.
  // If getYouTubeClient() fails, that will propagate up.
}

/**
 * Gets the best format based on quality
 */

/**
 * Gets the worst format based on quality
 */

/**
 * Gets the metadata for a YouTube video.
 * The actual download URL will be constructed by the server action
 * pointing to /api/download-video.
 */
export async function getYouTubeDownloadUrl(
  videoId: string, 
  options?: VideoDownloadOptions // Options might be used in the future for filtering metadata
): Promise<VideoMetadata> { // Changed return type
  try {
    // Fetch metadata
    const metadata = await getYouTubeVideoInfo(videoId);
    // Options like quality and format are not used here anymore to select a stream,
    // but could be used in the future if we wanted to filter available qualities/formats
    // in the metadata itself. For now, options are effectively unused here.
    return metadata;
  } catch (error) {
    console.error('Error getting YouTube video metadata:', error);
    // Re-throw the error to be handled by the caller (e.g., the server action)
    // This ensures that the server action knows the operation failed.
    if (error instanceof Error) {
      throw new Error(`Failed to get video metadata: ${error.message}`);
    }
    throw new Error('Failed to get video metadata due to an unknown error');
  }
}

/**
 * Validates if a video is downloadable
 */
export async function validateYouTubeVideo(videoId: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // We can leverage getYouTubeVideoInfo to check for availability and basic info
    // This avoids duplicating logic for error interpretation from yt.getInfo()
    await getYouTubeVideoInfo(videoId);
    
    // If getYouTubeVideoInfo didn't throw, we can proceed with other checks if needed.
    // For now, if getYouTubeVideoInfo succeeds, we consider it valid for download planning.
    // Specific format/stream validation happens later in the API route.
    // The original checks for is_private and streaming_data are implicitly covered
    // by getYouTubeVideoInfo's more robust error handling.
    
    // Example of an additional check if needed:
    // const yt = await getYouTubeClient();
    // const video = await yt.getInfo(videoId); // Redundant if getYouTubeVideoInfo is called
    // if (!video.streaming_data?.formats.length) {
    //   return { valid: false, error: 'No downloadable formats available (streaming_data check)' };
    // }
    
    return { valid: true };
  } catch (error: any) {
    // Catch errors thrown by getYouTubeVideoInfo or getYouTubeClient
    return { 
      valid: false, 
      error: error.message || 'Failed to validate video.'
    };
  }
}

/**
 * Creates a download stream for a YouTube video
 */
/*
export function createYouTubeDownloadStream(
  videoId: string,
  options: VideoDownloadOptions = {}
): NodeJS.ReadableStream {
  const quality = options.quality || VideoQuality.HIGH;
  const format = options.format || VideoFormat.MP4;
  
  // ytdl-core specific options and logic
  // const ytdlOptions: ytdl.downloadOptions = {
  //   quality: qualityMap[quality] as any, // qualityMap would need to be defined
  //   filter: (ytdlFormat: ytdl.videoFormat) => {
  //     const targetContainer = formatMap[format]; // formatMap would need to be defined
  //     if (targetContainer && ytdlFormat.container !== targetContainer) {
  //       return false;
  //     }
  //     return ytdlFormat.hasVideo && ytdlFormat.hasAudio;
  //   }
  // };
  
  // return ytdl(`https://www.youtube.com/watch?v=${videoId}`, ytdlOptions);
  throw new Error('createYouTubeDownloadStream is currently not implemented with youtubei.js. Use getYouTubeDownloadUrl instead.');
} 
*/ 