'use server';

import { 
  parseVideoUrl, 
  VideoPlatform, 
  VideoDownloadOptions,
  getYouTubeVideoInfo,
  getYouTubeDownloadUrl,
  validateYouTubeVideo 
} from '@/lib/video-downloader';

export interface VideoDownloadRequest {
  url: string;
  options?: VideoDownloadOptions;
}

export interface VideoDownloadResponse {
  success: boolean;
  data?: {
    downloadUrl: string;
    metadata: {
      title: string;
      duration?: number;
      thumbnail?: string;
      author?: string;
    };
  };
  error?: string;
}

/**
 * Server action to download a video
 */
export async function downloadVideo(request: VideoDownloadRequest): Promise<VideoDownloadResponse> {
  try {
    // Parse and validate the URL
    const videoInfo = parseVideoUrl(request.url);
    
    if (!videoInfo.isValid) {
      return {
        success: false,
        error: videoInfo.error || 'Invalid video URL'
      };
    }

    // Currently only YouTube is supported
    if (videoInfo.platform !== VideoPlatform.YOUTUBE) {
      return {
        success: false,
        error: `${videoInfo.platform} downloads are not yet supported. Currently only YouTube is available.`
      };
    }

    if (!videoInfo.videoId) {
      return {
        success: false,
        error: 'Could not extract video ID from URL'
      };
    }

    // Validate the YouTube video
    const validation = await validateYouTubeVideo(videoInfo.videoId);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Video cannot be downloaded'
      };
    }

    // Get download URL and metadata
    const result = await getYouTubeDownloadUrl(videoInfo.videoId, request.options);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to get download URL'
      };
    }

    const responseMetadata: { title: string; duration?: number; thumbnail?: string; author?: string } = {
      title: result.metadata?.title || 'Unknown Title'
    };

    if (result.metadata?.duration !== undefined) {
      responseMetadata.duration = result.metadata.duration;
    }
    if (result.metadata?.thumbnail) {
      responseMetadata.thumbnail = result.metadata.thumbnail;
    }
    if (result.metadata?.author) {
      responseMetadata.author = result.metadata.author;
    }
    console.log('result', result);
    return {
      success: true,
      data: {
        downloadUrl: result.videoUrl!,
        metadata: responseMetadata
      }
    };
  } catch (error) {
    console.error('Error downloading video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Server action to get video metadata without downloading
 */
export async function getVideoMetadata(url: string): Promise<VideoDownloadResponse> {
  try {
    const videoInfo = parseVideoUrl(url);
    
    if (!videoInfo.isValid) {
      return {
        success: false,
        error: videoInfo.error || 'Invalid video URL'
      };
    }

    if (videoInfo.platform !== VideoPlatform.YOUTUBE) {
      return {
        success: false,
        error: `${videoInfo.platform} is not yet supported`
      };
    }

    if (!videoInfo.videoId) {
      return {
        success: false,
        error: 'Could not extract video ID from URL'
      };
    }

    const metadata = await getYouTubeVideoInfo(videoInfo.videoId);
    
    const responseMetadata: { title: string; duration?: number; thumbnail?: string; author?: string } = {
      title: metadata.title || 'Unknown Title'
    };

    if (metadata.duration !== undefined) {
      responseMetadata.duration = metadata.duration;
    }
    if (metadata.thumbnail) {
      responseMetadata.thumbnail = metadata.thumbnail;
    }
    if (metadata.author) {
      responseMetadata.author = metadata.author;
    }
    
    return {
      success: true,
      data: {
        downloadUrl: '', // Not needed for metadata-only request
        metadata: responseMetadata
      }
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get video information'
    };
  }
} 