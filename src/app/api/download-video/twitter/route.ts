import { NextRequest, NextResponse } from 'next/server';
import { YtDlp } from 'ytdlp-nodejs';
import { VideoQuality, VideoFormatType } from '@/lib/video-downloader/types';
import { getTwitterVideoInfo } from '@/lib/video-downloader/platforms/twitter'; // Optional for title
import { Readable } from 'stream';

// Helper to map our VideoQuality enum to yt-dlp quality strings if needed
// For ytdlp-nodejs, the quality strings like '720p' might be directly usable.
function mapVideoQualityToYtdlpString(quality: VideoQuality): string {
  switch (quality) {
    case VideoQuality.Q_240P:
      return '240p';
    case VideoQuality.LOW:
      return '360p';
    case VideoQuality.MEDIUM:
      return '480p';
    case VideoQuality.HIGH:
      return '720p';
    case VideoQuality.FULL_HD:
      return '1080p';
    case VideoQuality.Q_1440P:
      return '1440p';
    case VideoQuality.ULTRA_HD:
      return '2160p';
    case VideoQuality.BEST:
      return 'highest'; // ytdlp-nodejs uses 'highest'
    case VideoQuality.WORST:
      return 'lowest'; // ytdlp-nodejs uses 'lowest'
    default:
      return 'highest';
  }
}


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');
  const qualityParam = searchParams.get('quality') as VideoQuality | null; // e.g., '720p', 'best'
  const formatParam = (searchParams.get('format') as VideoFormatType | null) || VideoFormatType.MP4; // Default to mp4

  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
  }
  if (!qualityParam) {
    return NextResponse.json({ error: 'quality is required' }, { status: 400 });
  }

  if (formatParam !== VideoFormatType.MP4) {
    // For Twitter, yt-dlp typically provides mp4. Other formats might require transcoding.
    // Sticking to mp4 for simplicity and direct stream compatibility.
    return NextResponse.json({ error: 'Only mp4 format is supported for Twitter videos' }, { status: 400 });
  }

  const twitterUrl = `https://twitter.com/anyuser/status/${videoId}`;
  let videoTitle = `twitter_video_${videoId}`;

  try {
    // Optionally fetch title for filename
    const metadata = await getTwitterVideoInfo(videoId);
    if (metadata && metadata.title && !metadata.error) {
      videoTitle = metadata.title.replace(/[^a-zA-Z0-9_.-]/g, '_'); // Sanitize title
    }
  } catch (e) {
    console.warn(`Failed to fetch video title for ${videoId}:`, e);
    // Proceed with default title
  }

  const ytdlp = new YtDlp();

  try {
    const ytdlpQuality = mapVideoQualityToYtdlpString(qualityParam);

    // Attempt to use the stream method from ytdlp-nodejs
    // The options should align with what ytdlp-nodejs expects for its stream() or exec() method.
    // For stream(), the format object might be:
    // { filter: 'audioandvideo', quality: ytdlpQuality, type: formatParam }
    // However, the ytdlp-nodejs docs for stream() are a bit sparse on complex format objects.
    // Let's try constructing a yt-dlp format selector string for more reliability,
    // and use exec() to get a raw stream.

    let formatSelector: string;
    if (ytdlpQuality === 'highest') {
      formatSelector = `bestvideo[ext=${formatParam}]+bestaudio[ext=m4a]/best[ext=${formatParam}]/best`;
    } else if (ytdlpQuality === 'lowest') {
      formatSelector = `worstvideo[ext=${formatParam}]+bestaudio[ext=m4a]/worst[ext=${formatParam}]/worst`;
    } else {
      // Specific quality, e.g., '720p'
      // yt-dlp format for specific height: bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]
      const height = parseInt(ytdlpQuality); // e.g., 720 from '720p'
      formatSelector = `bestvideo[height<=${height}][ext=${formatParam}]+bestaudio[ext=m4a]/best[ext=${formatParam}][height<=${height}]/best[height<=${height}]`;
    }

    console.log(`Using format selector: ${formatSelector} for URL: ${twitterUrl}`);

    // Using ytdlp.exec to get a ChildProcess and then stream its stdout
    // We need to pass '-o -' to tell yt-dlp to output to stdout
    const ytdlpProcess = ytdlp.exec(twitterUrl, {
      output: '-', // Output to stdout
      format: formatSelector,
      // noWarnings: true, // Optional: suppress yt-dlp warnings
      // quiet: true, // Optional: suppress all yt-dlp console output except for errors
    });

    if (!ytdlpProcess.stdout) {
      throw new Error('Failed to get readable stream from yt-dlp process.');
    }

    // Convert Node.js Readable stream to Web ReadableStream for NextResponse
    const webReadableStream = new ReadableStream({
      start(controller) {
        ytdlpProcess.stdout.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        ytdlpProcess.stdout.on('end', () => {
          controller.close();
        });
        ytdlpProcess.stdout.on('error', (err) => {
          controller.error(err);
        });
        ytdlpProcess.stderr.on('data', (data) => { // Log errors from yt-dlp
          console.error(`yt-dlp stderr: ${data}`);
        });
        ytdlpProcess.on('error', (error) => { // Handle errors from spawning the process
            console.error('Error with yt-dlp process:', error);
            controller.error(error);
        });
        ytdlpProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`yt-dlp process exited with code ${code}`);
                // It might be too late to controller.error() if stdout already ended.
                // This error primarily indicates an issue with yt-dlp execution itself.
            }
        });
      },
      cancel() {
        ytdlpProcess.kill();
      },
    });

    const headers = new Headers();
    headers.set('Content-Type', `video/${formatParam}`);
    headers.set('Content-Disposition', `attachment; filename="${videoTitle}.${formatParam}"`);

    return new NextResponse(webReadableStream, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('Error streaming Twitter video:', error);
    // Check if the error is from ytdlpProcess.on('error') or other known issues
    let errorMessage = 'Failed to stream video.';
    let statusCode = 500;

    if (error.message.includes('No media found') || error.message.includes('Unable to download webpage')) {
        errorMessage = 'Video not found or access denied.';
        statusCode = 404;
    } else if (error.message.includes('format not available')) {
        errorMessage = 'Requested quality or format not available.';
        statusCode = 400;
    } else if (error.message.includes('Unsupported URL')) {
        errorMessage = 'The provided URL is not supported.';
        statusCode = 400;
    }

    return NextResponse.json({ error: errorMessage, details: error.message || error }, { status: statusCode });
  }
}
