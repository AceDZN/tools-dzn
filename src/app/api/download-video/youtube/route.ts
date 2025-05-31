import { NextRequest, NextResponse } from 'next/server';
import Innertube from 'youtubei.js';
import { VideoQuality, VideoFormat } from '@/lib/video-downloader/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');
  const quality = searchParams.get('quality') as VideoQuality | null;
  const format = searchParams.get('format') as VideoFormat | null;

  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
  }

  if (!quality) {
    return NextResponse.json({ error: 'quality is required' }, { status: 400 });
  }

  if (!format) {
    return NextResponse.json({ error: 'format is required' }, { status: 400 });
  }

  let slugifiedTitle = 'video'; // Default title

  try {
    const yt = await Innertube.create();

    try {
      const videoInfo = await yt.getBasicInfo(videoId);
      if (videoInfo.basic_info.title) {
        slugifiedTitle = videoInfo.basic_info.title.replace(/[^a-zA-Z0-9_.-]/g, '_');
      } else {
        console.warn(`Video title not found for videoId: ${videoId}. Using default filename.`);
      }
    } catch (infoError: any) {
      // Log error from getBasicInfo but proceed with default title
      // The download itself might still work
      console.error(`Error fetching video info for title (videoId: ${videoId}):`, infoError.message);
      // slugifiedTitle remains 'video'
    }

    // Diagnostic logging: Get full video info for available formats
    try {
      const fullVideoInfo = await yt.getInfo(videoId); // Call getInfo()
      console.log('Attempting download for videoId:', videoId, 'quality:', quality, 'format:', format);
      // Ensure streaming_data and its properties are accessed safely
      if (fullVideoInfo.streaming_data) {
        console.log('Available muxed formats (yt.getInfo):', JSON.stringify(fullVideoInfo.streaming_data.formats || [], null, 2));
        console.log('Available adaptive formats (yt.getInfo):', JSON.stringify(fullVideoInfo.streaming_data.adaptive_formats || [], null, 2));
      } else {
        console.log('No streaming_data available in fullVideoInfo for videoId:', videoId);
      }
    } catch (getInfoError: any) {
      // Log the error and return a 500 response.
      // This is a safeguard; ideally, issues with videoId should be caught earlier.
      console.error(`Critical error: yt.getInfo failed for videoId ${videoId} in download route:`, getInfoError.message);
      return NextResponse.json({ error: 'Failed to retrieve crucial video information before download.', details: getInfoError.message }, { status: 500 });
    }
    // End diagnostic logging

    const stream = await yt.download(videoId, {
      quality: quality, // This should be the string value like '1080p', 'best', etc.
      format: format, // This should be the string value like 'mp4', 'webm', etc.
      type: 'video+audio', // TODO: make this configurable, or determine best type
    });

    // The stream from yt.download() is a Node.js ReadableStream.
    // NextResponse can handle this directly.
    // No need to check if stream is null, yt.download() would throw on failure.

    const response = new NextResponse(stream as any, { // Cast to any to bypass type mismatch for now
      status: 200,
      headers: {
        'Content-Type': `video/${format === 'mp4' ? 'mp4' : 'webm'}`,
        'Content-Disposition': `attachment; filename="${slugifiedTitle}.${format}"`,
      },
    });

    return response;

  } catch (error: any) {
    console.error(`Error downloading video (videoId: ${videoId}, quality: ${quality}, format: ${format}):`, error);

    // Try to provide more specific error messages based on youtubei.js errors
    let errorMessage = 'Failed to download video.';
    let status = 500;

    if (error.message?.includes('unavailable') || error.message?.includes('private')) {
      errorMessage = 'The requested video is private or unavailable.';
      status = 403; // Forbidden
    } else if (error.message?.includes('not found') || error.message?.includes('Invalid video id')) {
      errorMessage = 'The requested video was not found.';
      status = 404; // Not Found
    } else if (error.message?.includes('No matching formats found') || error.message?.includes('Invalid download options')) {
      // More specific and user-friendly message for this common case
      errorMessage = "The requested quality or format is not available for this video. Please try a different selection or 'Best Available'.";
      status = 400; // Bad Request
    } else if (error.message) {
      // For other errors, use the message from youtubei.js if available
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage, details: error.message }, { status });
  }
}
