import { Metadata } from 'next';
import { VideoDownloaderTool } from './video-downloader-tool';
import { generateToolMetadata } from '@/components/tools/tool-page-wrapper';

export const metadata: Metadata = generateToolMetadata({
  title: 'Video Downloader',
  description: 'Download videos from YouTube, Twitter, Instagram, and Facebook with multiple quality options. Fast, free, and secure video downloading tool.',
  keywords: ['video downloader', 'youtube downloader', 'twitter video', 'instagram video', 'facebook video', 'online video download'],
});

export default function VideoDownloaderPage() {
  return <VideoDownloaderTool />;
} 