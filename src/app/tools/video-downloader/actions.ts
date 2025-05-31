'use server';

import { 
  parseVideoUrl, 
  VideoPlatform, 
  VideoDownloadOptions,
  VideoMetadata, // Import the main VideoMetadata type
  getYouTubeVideoInfo,
  // getYouTubeDownloadUrl, // We might not need this if getYouTubeVideoInfo provides enough
  validateYouTubeVideo,
  getTwitterVideoInfo,
  validateTwitterVideo,
  VideoQuality // For default quality
} from '@/lib/video-downloader';

export interface VideoDownloadRequest {
  url: string;
  options?: VideoDownloadOptions;
}

// This response will now return the full VideoMetadata object as defined in types.ts
export interface VideoRequestResponse { // Renamed for clarity (used by both actions)
  success: boolean;
  data?: {
    downloadUrl?: string; // Optional, only for downloadVideo action
    metadata: VideoMetadata;
  };
  error?: string;
  errorDetails?: any; // For debugging
}


/**
 * Server action to download a video
 */
export async function downloadVideo(request: VideoDownloadRequest): Promise<VideoRequestResponse> {
  try {
    const videoInfo = parseVideoUrl(request.url);
    
    if (!videoInfo.isValid || !videoInfo.videoId || !videoInfo.platform) {
      return {
        success: false,
        error: videoInfo.error || 'Invalid video URL or could not determine platform/ID.'
      };
    }

    let title = 'video';
    let downloadUrl = '';
    const quality = request.options?.quality || VideoQuality.BEST;
    const format = request.options?.format || 'mp4'; // yt-dlp default, mp4 for twitter

    switch (videoInfo.platform) {
      case VideoPlatform.YOUTUBE:
        const ytValidation = await validateYouTubeVideo(videoInfo.videoId);
        if (!ytValidation.valid) {
          return { success: false, error: ytValidation.error || 'YouTube video cannot be downloaded' };
        }
        // Fetch title for YouTube video
        const ytMetadata = await getYouTubeVideoInfo(videoInfo.videoId);
        title = ytMetadata.title || `youtube_video_${videoInfo.videoId}`;
        downloadUrl = `/api/download-video/youtube?videoId=${videoInfo.videoId}&quality=${quality}&format=${format}`;
        break;

      case VideoPlatform.TWITTER:
        const twitterValidation = await validateTwitterVideo(videoInfo.videoId);
        if (!twitterValidation.valid) {
          return { success: false, error: twitterValidation.error || 'Twitter video cannot be downloaded' };
        }
        // Fetch title for Twitter video
        const twitterMetadata = await getTwitterVideoInfo(videoInfo.videoId);
        if (twitterMetadata.error) {
          // This case should ideally be caught by validateTwitterVideo, but as a fallback:
          return { success: false, error: `Failed to get Twitter video metadata: ${twitterMetadata.error}` };
        }
        title = twitterMetadata.title || `twitter_video_${videoInfo.videoId}`;
        // Twitter API route currently defaults to mp4 and handles quality mapping
        downloadUrl = `/api/download-video/twitter?videoId=${videoInfo.videoId}&quality=${quality}&format=mp4`;
        break;

      default:
        return {
          success: false,
          error: `${videoInfo.platform} downloads are not yet supported.`
        };
    }
    
    // Return a minimal metadata for the download response, primarily for filename suggestion
    // The full metadata is fetched by getVideoMetadata
    const responseMetadata: Partial<VideoMetadata> = {
      title: title,
      platform: videoInfo.platform,
      id: videoInfo.videoId
    };

    return {
      success: true,
      data: {
        downloadUrl: downloadUrl,
        metadata: responseMetadata as VideoMetadata // Cast as partial is fine for this response
      }
    };
  } catch (error: any) {
    console.error('Error in downloadVideo action:', error);
    // Ensure VideoMetadata with error is returned for consistency if needed by client
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      errorDetails: error,
      data: { // Provide metadata shell on error too
        metadata: {
          platform: videoInfo?.platform || VideoPlatform.UNKNOWN,
          id: videoInfo?.videoId || '',
          title: 'Error',
          duration: 0,
          qualities: [],
          formats: [],
          error: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
      }
    };
  }
}

/**
 * Server action to get video metadata without downloading
 */
export async function getVideoMetadata(url: string): Promise<VideoRequestResponse> {
  try {
    const videoInfo = parseVideoUrl(url);
    
    if (!videoInfo.isValid || !videoInfo.videoId || !videoInfo.platform) {
      return {
        success: false,
        error: videoInfo.error || 'Invalid video URL or could not determine platform/ID.'
      };
    }

    let metadata: VideoMetadata;

    switch (videoInfo.platform) {
      case VideoPlatform.YOUTUBE:
        metadata = await getYouTubeVideoInfo(videoInfo.videoId);
        // Assuming getYouTubeVideoInfo is updated to return VideoMetadata
        // including qualities: VideoQuality[]
        // If not, mapping from its formats would be needed here.
        // For now, we'll rely on its structure matching VideoMetadata.
        if (!metadata.qualities || metadata.qualities.length === 0) {
          // Fallback or mock if YouTube qualities aren't readily available
          // For a real implementation, ensure getYouTubeVideoInfo provides this.
          console.warn(`YouTube video ${videoInfo.videoId} did not return specific qualities. Adding defaults.`);
          // metadata.qualities = [VideoQuality.BEST, VideoQuality.HIGH, VideoQuality.MEDIUM, VideoQuality.LOW];
        }
        break;

      case VideoPlatform.TWITTER:
        metadata = await getTwitterVideoInfo(videoInfo.videoId);
        // getTwitterVideoInfo already returns VideoMetadata with qualities: VideoQuality[]
        break;

      default:
        return {
          success: false,
          error: `${videoInfo.platform} metadata retrieval is not yet supported.`
        };
    }

    if (metadata.error) {
      return {
        success: false,
        error: metadata.error,
        data: { metadata } // Return metadata even if it contains an error field
      };
    }
    
    return {
      success: true,
      data: {
        metadata: metadata
      }
    };
  } catch (error: any) {
    console.error('Error getting video metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get video information'
    };
  }
} 