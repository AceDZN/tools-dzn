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
  try {
    const yt = await getYouTubeClient();
    const video = await yt.getInfo(videoId);
    const basicInfo = video.basic_info;
    
    // Get available qualities
    const qualities = new Set<VideoQuality>();
    video.streaming_data?.formats.forEach(format => {
      const height = format.height;
      if (height) {
        switch (height) {
          case 2160:
            qualities.add(VideoQuality.ULTRA_HD);
            break;
          case 1080:
            qualities.add(VideoQuality.FULL_HD);
            break;
          case 720:
            qualities.add(VideoQuality.HIGH);
            break;
          case 480:
            qualities.add(VideoQuality.MEDIUM);
            break;
          case 360:
            qualities.add(VideoQuality.LOW);
            break;
        }
      }
    });

    // Ensure required fields are not undefined
    if (!basicInfo.title) {
      throw new Error('Video title not found');
    }

    return {
      title: basicInfo.title,
      duration: basicInfo.duration || 0,
      thumbnail: basicInfo.thumbnail?.[0]?.url,
      author: basicInfo.author || 'Unknown',
      uploadDate: undefined, // Remove publish_date as it's not available in basic_info
      availableQualities: Array.from(qualities)
    };
  } catch (error) {
    console.error('Error fetching YouTube video info:', error);
    throw new Error(`Failed to fetch video information: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the best format based on quality
 */

/**
 * Gets the worst format based on quality
 */

/**
 * Gets the download URL for a YouTube video
 */
export async function getYouTubeDownloadUrl(
  videoId: string, 
  options: VideoDownloadOptions = {}
): Promise<DownloadResult> {
  try {
    const yt = await getYouTubeClient();
    
    // Fetch metadata first
    const metadata = await getYouTubeVideoInfo(videoId);

    // Map our quality enum to youtubei.js quality string
    const quality = options.quality || VideoQuality.HIGH;
    const format = options.format || VideoFormat.MP4;

    // Get the download stream
    const stream = await yt.download(videoId, {
      type: 'video', // Get video+audio stream
      quality: quality === VideoQuality.BEST ? 'best' : quality,
      format: format.toLowerCase()
    });

    // Convert stream to blob URL or data URL that can be downloaded
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const blob = new Blob(chunks, { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    return {
      success: true,
      videoUrl: url,
      metadata
    };
  } catch (error) {
    console.error('Error getting YouTube download URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get download URL'
    };
  }
}

/**
 * Validates if a video is downloadable
 */
export async function validateYouTubeVideo(videoId: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const yt = await getYouTubeClient();
    const video = await yt.getInfo(videoId);
    const basicInfo = video.basic_info;
    
    // Check if video is private
    if (basicInfo.is_private) {
      return { valid: false, error: 'Video is private' };
    }
    
    // Check if video has downloadable formats
    if (!video.streaming_data?.formats.length) {
      return { valid: false, error: 'No downloadable formats available' };
    }
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Failed to validate video' 
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