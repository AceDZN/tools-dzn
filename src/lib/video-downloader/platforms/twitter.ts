// src/lib/video-downloader/platforms/twitter.ts
import { YtDlp } from 'ytdlp-nodejs';
import type { VideoMetadata, VideoQuality, VideoPlatformFormat } from '../types';
import { VideoPlatform } from '../types';

// Initialize ytdlp
// We can customize binary paths if needed, but defaults should work for most.
// const ytdlp = new YtDlp(); // This will download yt-dlp binary on first use to a default path
// For Next.js, it's better to initialize it inside functions or ensure it's a singleton
// to avoid issues with multiple downloads or binary path configurations during build vs. runtime.
// However, ytdlp-nodejs is designed to handle this by checking/downloading binary on first command.

/**
 * Maps yt-dlp format height to VideoQuality enum.
 * @param height - The height of the video format.
 * @returns The corresponding VideoQuality.
 */
const mapHeightToVideoQuality = (height: number): VideoQuality | null => {
  if (height >= 2160) return VideoQuality.ULTRA_HD;
  if (height >= 1440) return VideoQuality.Q_1440P;
  if (height >= 1080) return VideoQuality.FULL_HD;
  if (height >= 720) return VideoQuality.HIGH; // HD
  if (height >= 480) return VideoQuality.MEDIUM; // SD
  if (height >= 360) return VideoQuality.LOW; // SD
  if (height >= 240) return VideoQuality.Q_240P;
  return null;
};

/**
 * Fetches video metadata for a given Twitter video ID.
 * @param tweetId - The ID of the tweet.
 * @returns A promise that resolves to the video metadata.
 */
export const getTwitterVideoInfo = async (tweetId: string): Promise<VideoMetadata> => {
  const ytdlp = new YtDlp();
  const twitterUrl = `https://twitter.com/anyuser/status/${tweetId}`;

  try {
    const info = await ytdlp.getInfoAsync(twitterUrl);

    // Type guard to ensure we have video info (not playlist info for example)
    if (info._type !== 'video' && !info.formats) {
      // Sometimes info._type might be 'playlist' for a single tweet if it's embedded
      // but formats are directly on the main info object for Twitter.
      // If 'formats' isn't there, it's likely not a video or not what we expect.
       if (!('formats' in info) || !Array.isArray(info.formats)) {
        throw new Error('No video formats found or invalid video information structure.');
      }
    }

    const title = info.title || info.fulltitle || `Twitter Video ${tweetId}`;
    const duration = typeof info.duration === 'number' ? info.duration : 0;
    const thumbnailUrl = info.thumbnail || undefined;
    const author = info.uploader || info.channel || 'Unknown Author';

    const availableQualities: VideoQuality[] = [];
    const platformFormats: VideoPlatformFormat[] = [];

    if (info.formats && Array.isArray(info.formats)) {
      info.formats.forEach((format: any) => {
        // Ensure it's a video format, typically mp4 for Twitter
        if (format.ext === 'mp4' && format.vcodec !== 'none' && format.height) {
          const quality = mapHeightToVideoQuality(format.height);
          if (quality && !availableQualities.includes(quality)) {
            availableQualities.push(quality);
          }
          platformFormats.push({
            itag: format.format_id,
            url: format.url,
            mimeType: format.vcodec && format.acodec ? `video/mp4; codecs="${format.vcodec}, ${format.acodec}"` : `video/mp4; codecs="${format.vcodec}"`,
            width: format.width,
            height: format.height,
            bitrate: format.tbr, // Total bitrate (video + audio) in kbit/s
            qualityLabel: format.format_note || `${format.height}p`,
            fps: format.fps,
          });
        }
      });
    }

    // Sort qualities from best to worst based on enum order (assuming enum is ordered that way)
    // This requires VideoQuality enum values to be sortable (e.g., higher value = better quality)
    // For now, let's sort based on typical visual quality order
    const qualityOrder = [
        VideoQuality.ULTRA_HD, VideoQuality.Q_1440P, VideoQuality.FULL_HD,
        VideoQuality.HIGH, VideoQuality.MEDIUM, VideoQuality.LOW, VideoQuality.Q_240P
    ];
    availableQualities.sort((a, b) => qualityOrder.indexOf(a) - qualityOrder.indexOf(b));

    if (availableQualities.length === 0 && platformFormats.length > 0) {
        // If specific mapping failed but we have formats, add a generic BEST
        availableQualities.push(VideoQuality.BEST);
    }


    return {
      platform: VideoPlatform.TWITTER,
      id: tweetId,
      title,
      duration,
      thumbnailUrl,
      author,
      qualities: availableQualities,
      formats: platformFormats, // Store raw formats for potential direct download use
    };
  } catch (error: any) {
    console.error(`Error fetching Twitter video info for ID ${tweetId}:`, error);
    // Provide a more specific error message if possible
    let errorMessage = 'Failed to fetch video information.';
    if (error.message.includes('Video unavailable')) {
      errorMessage = 'This video is unavailable.';
    } else if (error.message.includes('Private video')) {
      errorMessage = 'This video is private.';
    } else if (error.message.includes('No media found')) {
        errorMessage = 'No media found in the tweet or the URL is invalid.';
    }

    // Return a partial metadata object or throw a custom error
    // For now, returning a metadata object with error status
    return {
        platform: VideoPlatform.TWITTER,
        id: tweetId,
        title: `Twitter Video ${tweetId}`,
        duration: 0,
        author: 'Unknown',
        qualities: [],
        formats: [],
        error: errorMessage,
    };
  }
};

/**
 * Validates if a Twitter video is accessible and contains video info.
 * @param tweetId - The ID of the tweet.
 * @returns A promise that resolves to an object indicating validity and an optional error message.
 */
export const validateTwitterVideo = async (tweetId: string): Promise<{ valid: boolean; error?: string }> => {
  const ytdlp = new YtDlp();
  const twitterUrl = `https://twitter.com/anyuser/status/${tweetId}`;

  try {
    // Using getInfoAsync as a way to validate.
    // We could use a lighter command if yt-dlp had one that just checks existence,
    // but getInfoAsync is comprehensive.
    const info = await ytdlp.getInfoAsync(twitterUrl);

    // Check if there are video formats available
    // This check needs to be robust based on yt-dlp's output structure for Twitter
    const hasVideoFormats = info.formats && Array.isArray(info.formats) &&
                            info.formats.some((f: any) => f.vcodec !== 'none' && f.ext === 'mp4');

    if (hasVideoFormats) {
      return { valid: true };
    } else {
      return { valid: false, error: 'No downloadable video formats found in the tweet.' };
    }
  } catch (error: any) {
    console.error(`Error validating Twitter video for ID ${tweetId}:`, error);
    let errorMessage = 'Video is not valid or could not be accessed.';
    if (error.message.includes('Video unavailable')) {
      errorMessage = 'This video is unavailable.';
    } else if (error.message.includes('Private video')) {
      errorMessage = 'This video is private.';
    } else if (error.message.includes('No media found')) {
        errorMessage = 'No media found in the tweet or the URL is invalid.';
    } else if (error.message.includes('not found or private')) {
        errorMessage = 'Tweet not found or private.'
    }
    return { valid: false, error: errorMessage };
  }
};
