import { NextRequest, NextResponse } from 'next/server';
import Innertube, { UniversalCache, Utils } from 'youtubei.js';
// Import VideoInfo type from youtubei.js if available and suitable, or use a custom one
// For example, if VideoInfo is a class: import { VideoInfo } from 'youtubei.js/dist/src/parser/youtube';
// Or if it's part of the main export: import { Innertube, VideoInfo } from 'youtubei.js';

import { VideoQuality, VideoFormat } from '@/lib/video-downloader/types';

// Define YoutubeiFormat interface (as Innertube.Format is not directly exported for this use)
interface YoutubeiFormat {
  itag: number;
  mime_type: string;
  quality_label?: string;
  height?: number;
  width?: number;
  has_audio?: boolean;
  has_video?: boolean; // Added for clarity, often available
  [key: string]: any; // Allow other properties
}

// Helper function to find a specific format
async function findSpecificFormat(
  videoInfoInstance: any, // Should be an instance of Innertube.VideoInfo
  requestedQualityLabel: string, // e.g., '720p', 'best', 'worst'
  requestedFormatContainer: string // e.g., 'mp4'
): Promise<YoutubeiFormat | null> {
  // Handle 'best' and 'worst' quality requests directly if possible,
  // or let youtubei.js handle them if we don't find a specific match.
  // For this implementation, we'll focus on specific quality labels.
  // If 'best' or 'worst' is passed, this function will likely return null
  // unless they exactly match a quality_label (which is unlikely for 'best'/'worst').
  // The calling code will need to handle 'best'/'worst' if specificFormat is null.

  const { formats, adaptive_formats } = videoInfoInstance.streaming_data || {};

  const allFormats: YoutubeiFormat[] = [];
  if (formats?.length) {
    allFormats.push(...formats.map((f: any) => f as YoutubeiFormat));
  }
  if (adaptive_formats?.length) {
    allFormats.push(...adaptive_formats.map((f: any) => f as YoutubeiFormat));
  }

  let bestMatch: YoutubeiFormat | null = null;

  for (const fmt of allFormats) {
    const mimeType = fmt.mime_type || '';
    // Construct a quality label from height if quality_label is missing
    const qualityLabel = fmt.quality_label || (fmt.height ? `${fmt.height}p` : '');

    if (
      qualityLabel === requestedQualityLabel &&
      mimeType.includes(requestedFormatContainer)
    ) {
      // Prioritize directly muxed stream (has both audio and video)
      if (fmt.has_audio === true && fmt.has_video === true) {
        return fmt; // Found a good muxed stream
      }
      // If not muxed, store the first matching adaptive stream (could be video-only or audio-only)
      // We are interested in video streams primarily for this logic.
      if (!bestMatch && fmt.has_video === true) {
        bestMatch = fmt;
      }
    }
  }

  // If no directly muxed found, return the best video-only adaptive stream found
  if (bestMatch) {
    return bestMatch;
  }

  return null;
}


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');
  const qualityLabel = searchParams.get('quality') as VideoQuality | null; // e.g. '1080p', 'best'
  const formatContainer = searchParams.get('format') as VideoFormat | null; // e.g. 'mp4'

  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
  }

  if (!qualityLabel) {
    return NextResponse.json({ error: 'quality is required' }, { status: 400 });
  }

  if (!formatContainer) {
    return NextResponse.json({ error: 'format is required' }, { status: 400 });
  }

  let slugifiedTitle = 'video'; // Default title
  let videoDetails: any; // To store result of yt.getInfo()

  try {
    const yt = await Innertube.create();

    // 1. Fetch video metadata for title (and potentially for specific format finding)
    try {
      // Using getBasicInfo for title as it's lighter
      const basicVideoInfo = await yt.getBasicInfo(videoId);
      if (basicVideoInfo.basic_info.title) {
        slugifiedTitle = basicVideoInfo.basic_info.title.replace(/[^a-zA-Z0-9_.-]/g, '_');
      } else {
        console.warn(`Video title not found for videoId: ${videoId}. Using default filename.`);
      }
    } catch (infoError: any) {
      console.error(`Error fetching basic video info for title (videoId: ${videoId}):`, infoError.message);
      // Continue with default title, download might still work if videoId is valid
    }

    // 2. Fetch full video info for format selection and logging
    try {
      videoDetails = await yt.getInfo(videoId);
      // Diagnostic logging
      console.log('Attempting download for videoId:', videoId, 'requested quality:', qualityLabel, 'requested format container:', formatContainer);
      if (videoDetails.streaming_data) {
        console.log('Available muxed formats (yt.getInfo):', JSON.stringify(videoDetails.streaming_data.formats || [], null, 2));
        console.log('Available adaptive formats (yt.getInfo):', JSON.stringify(videoDetails.streaming_data.adaptive_formats || [], null, 2));
      } else {
        console.log('No streaming_data available in videoDetails for videoId:', videoId);
      }
    } catch (getInfoError: any) {
      console.error(`Critical error: yt.getInfo failed for videoId ${videoId} in download route:`, getInfoError.message);
      return NextResponse.json({ error: 'Failed to retrieve crucial video information for download.', details: getInfoError.message }, { status: 500 });
    }

    let stream;

    // 3. Handle 'best' and 'worst' quality directly with youtubei.js's simplified download options
    if (qualityLabel === VideoQuality.BEST || qualityLabel === VideoQuality.WORST) {
      console.log(`Attempting download with generic quality: '${qualityLabel}' and format container: '${formatContainer}'`);
      try {
        stream = await yt.download(videoId, {
          quality: qualityLabel, // 'best' or 'worst'
          format: formatContainer,
          type: 'video+audio'
        });
      } catch (e_generic_quality) {
        console.error(`Error downloading with generic quality '${qualityLabel}':`, e_generic_quality.message);
        // This error often means no suitable format was found by youtubei.js
        return NextResponse.json({
            error: `The requested video is not available in '${formatContainer}' format with '${qualityLabel}' quality. Please try a different selection.`,
            details: e_generic_quality.message
        }, { status: 400 });
      }
    } else {
      // 4. For specific quality labels (e.g., '1080p'), find the specific format object
      const specificFormat = await findSpecificFormat(videoDetails, qualityLabel, formatContainer);
      console.log('Found specific format object:', specificFormat ? {itag: specificFormat.itag, mime: specificFormat.mime_type, q: specificFormat.quality_label} : null);

      if (specificFormat) {
        console.log(`Attempting download with specific format object (itag: ${specificFormat.itag})`);
        try {
          stream = await yt.download(videoId, {
            format: specificFormat, // Pass the actual format object
            type: 'video+audio'
          });
        } catch (e_specific) {
          console.error('Error downloading with specific format object:', e_specific.message);
          return NextResponse.json({
              error: "The specifically chosen format failed to download. Please try another quality.",
              details: e_specific.message
          }, { status: 400 });
        }
      } else {
        console.log(`No specific format object found matching quality '${qualityLabel}' and container '${formatContainer}'.`);
        return NextResponse.json({
          error: "The requested quality or format is not available for this video. Please try a different selection or 'Best Available'.",
          details: `Could not find a viable format matching quality '${qualityLabel}' and container '${formatContainer}'.`
        }, { status: 400 });
      }
    }

    if (!stream) {
      // This case should ideally be handled by the specific error returns above.
      console.error('Stream is undefined after download attempts. This should not happen.');
      return NextResponse.json({ error: 'Failed to initiate download stream for an unknown reason.' }, { status: 500 });
    }

    // 5. Stream the response
    const response = new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': `video/${formatContainer}`, // Use the requested format container
        'Content-Disposition': `attachment; filename="${slugifiedTitle}.${formatContainer}"`,
      },
    });
    return response;

  } catch (error: any) { // Main catch block for unexpected errors
    console.error(`Unhandled error during video download processing (videoId: ${videoId}, quality: ${qualityLabel}, format: ${formatContainer}):`, error);

    // This block now primarily catches errors from Innertube.create(), or truly unexpected issues.
    // Specific download errors (like format not found) should be handled within the try block.
    let errorMessage = 'An unexpected error occurred while processing the video download.';
    let status = 500;
    let details = error.message || 'Unknown error';

    // Refine based on known error types if possible, though most should be caught above.
    if (error.message?.includes('unavailable') || error.message?.includes('private')) {
      errorMessage = 'The requested video is private or unavailable.';
      status = 403;
    } else if (error.message?.includes('not found') || error.message?.includes('Invalid video id')) {
      errorMessage = 'The requested video was not found.';
      status = 404;
    }

    return NextResponse.json({ error: errorMessage, details: details }, { status });
  }
}
