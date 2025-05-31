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

    const stream = await yt.download(videoId, {
      quality: quality,
      format: format,
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
    } else if (error.message?.includes('Invalid download options') || error.message?.includes('No matching formats found')) {
      errorMessage = `The requested quality or format is not available for this video. Details: ${error.message}`;
      status = 400; // Bad Request
    } else if (error.message) {
      errorMessage = error.message; // Use the error message from youtubei.js if available
    }

    return NextResponse.json({ error: errorMessage, details: error.message }, { status });
  }
}
