'use client';

import { useState } from 'react';
import { Download, Video, Zap, Shield, Link, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { parseVideoUrl, getPlatformDisplayName, VideoPlatform, VideoQuality, VideoFormat } from '@/lib/video-downloader';
import { downloadVideo } from './actions';
import { cn } from '@/lib/utils';

interface DownloadState {
  isLoading: boolean;
  progress: number;
  error?: string;
  success?: boolean;
  downloadUrl?: string;
  videoTitle?: string;
}

export function VideoDownloaderTool() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<VideoQuality>(VideoQuality.HIGH);
  const [format, setFormat] = useState<VideoFormat>(VideoFormat.MP4);
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isLoading: false,
    progress: 0,
  });

  const features = [
    {
      icon: <Video className="h-5 w-5 text-primary" />,
      title: 'Multiple Platforms',
      description: 'Support for YouTube, Twitter, Instagram, and Facebook',
    },
    {
      icon: <Zap className="h-5 w-5 text-primary" />,
      title: 'High Quality',
      description: 'Download in various qualities up to 4K resolution',
    },
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: 'Safe & Secure',
      description: 'No data storage, direct downloads to your device',
    },
  ];

  const usageInstructions = [
    'Paste the video URL from YouTube, Twitter, Instagram, or Facebook',
    'Select your preferred video quality and format',
    'Click download and wait for processing',
    'Save the video file to your device',
  ];

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear any previous errors when user types
    if (downloadState.error) {
      setDownloadState({ isLoading: false, progress: 0 });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      // Clear any previous errors when pasting
      if (downloadState.error) {
        setDownloadState({ isLoading: false, progress: 0 });
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  };

  const handleDownload = async () => {
    // Validate URL
    const videoInfo = parseVideoUrl(url);
    
    if (!videoInfo.isValid) {
      setDownloadState({
        isLoading: false,
        progress: 0,
        error: videoInfo.error || 'Invalid URL',
      });
      return;
    }

    // Start download process
    setDownloadState({ isLoading: true, progress: 0 });

    try {
      // Call the server action
      const result = await downloadVideo({
        url,
        options: { quality, format }
      });

      if (result.success && result.data) {
        // Trigger browser download
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        // The filename (including extension) is now set by the Content-Disposition header
        // in the API route. The 'download' attribute here can suggest a name if the header is missing,
        // or if the browser chooses to use it. It's good to keep it simple.
        link.download = result.data.metadata.title || 'video';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadState({
          isLoading: false,
          progress: 100,
          success: true,
          downloadUrl: result.data.downloadUrl,
          videoTitle: result.data.metadata.title
        });
        
        // Reset after 5 seconds
        setTimeout(() => {
          setDownloadState({ isLoading: false, progress: 0 });
        }, 5000);
      } else {
        setDownloadState({
          isLoading: false,
          progress: 0,
          error: result.error || 'Download failed. Please try again.',
        });
      }
    } catch (error) {
      setDownloadState({
        isLoading: false,
        progress: 0,
        error: 'Download failed. Please try again.',
      });
    }
  };

  const videoInfo = url ? parseVideoUrl(url) : null;
  const platformIcon = videoInfo?.isValid && videoInfo.platform !== VideoPlatform.UNKNOWN ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <CheckCircle className="h-4 w-4 text-green-500" />
      {getPlatformDisplayName(videoInfo.platform)} video detected
      {videoInfo.platform !== VideoPlatform.YOUTUBE && (
        <span className="text-orange-600">(coming soon)</span>
      )}
    </div>
  ) : null;

  return (
    <ToolPageTemplate
      title="Video Downloader"
      description="Download videos from popular social media platforms"
      icon={<Download className="h-8 w-8 text-primary" />}
      features={features}
      usageInstructions={usageInstructions}
      isComingSoon={false}
    >
      <div className="space-y-6">
        {/* URL Input Section */}
        <Card>
          <CardContent className="p-6">
      <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="video-url" className="text-sm font-medium">
                  Video URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="video-url"
                      type="url"
                      placeholder="Paste video URL here..."
                      value={url}
                      onChange={handleUrlChange}
                      className="pl-9"
                      disabled={downloadState.isLoading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePaste}
                    disabled={downloadState.isLoading}
                  >
                    Paste
                  </Button>
                </div>
                {platformIcon}
              </div>

              {/* Quality and Format Selection */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="quality" className="text-sm font-medium">
                    Quality
                  </label>
                  <Select
                    value={quality}
                    onValueChange={(value) => setQuality(value as VideoQuality)}
                    disabled={downloadState.isLoading}
                  >
                    <SelectTrigger id="quality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VideoQuality.BEST}>Best Available</SelectItem>
                      <SelectItem value={VideoQuality.ULTRA_HD}>4K (2160p)</SelectItem>
                      <SelectItem value={VideoQuality.Q_1440P}>2K (1440p)</SelectItem>
                      <SelectItem value={VideoQuality.FULL_HD}>Full HD (1080p)</SelectItem>
                      <SelectItem value={VideoQuality.HIGH}>HD (720p)</SelectItem>
                      <SelectItem value={VideoQuality.MEDIUM}>SD (480p)</SelectItem>
                      <SelectItem value={VideoQuality.LOW}>Low (360p)</SelectItem>
                      <SelectItem value={VideoQuality.Q_240P}>Very Low (240p)</SelectItem>
                      <SelectItem value={VideoQuality.WORST}>Worst Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="format" className="text-sm font-medium">
                    Format
                  </label>
                  <Select
                    value={format}
                    onValueChange={(value) => setFormat(value as VideoFormat)}
                    disabled={downloadState.isLoading}
                  >
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VideoFormat.MP4}>MP4</SelectItem>
                      <SelectItem value={VideoFormat.WEBM}>WebM</SelectItem>
                      <SelectItem value={VideoFormat.AVI}>AVI</SelectItem>
                      <SelectItem value={VideoFormat.MOV}>MOV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                disabled={!url || downloadState.isLoading}
                className="w-full"
                size="lg"
              >
                {downloadState.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Video...
                  </>
                ) : downloadState.success ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Download Complete!
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Video
                  </>
                )}
              </Button>

              {/* Success Message */}
              {downloadState.success && downloadState.videoTitle && (
                <div className="space-y-2">
                  <div className="rounded-md bg-green-50 p-3 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <p className="text-sm font-medium">
                      Successfully downloaded: {downloadState.videoTitle}
                    </p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {downloadState.isLoading && (
                <div className="space-y-2">
                  <div className="text-center text-sm text-muted-foreground">
                    Getting video information and download link...
                  </div>
                </div>
              )}

              {/* Error Message */}
              {downloadState.error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{downloadState.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform Support Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Supported Platforms</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { name: 'YouTube', icon: '🎬', supported: true },
                { name: 'Twitter/X', icon: '🐦', supported: false },
                { name: 'Instagram', icon: '📷', supported: false },
                { name: 'Facebook', icon: '👍', supported: false },
                { name: 'LinkedIn', icon: '💼', supported: false },
              ].map((platform) => (
                <div
                  key={platform.name}
                  className={cn(
                    'flex items-center gap-2 rounded-md border p-3 text-sm',
                    'transition-colors hover:bg-secondary',
                    platform.supported ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                  )}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <div className="flex flex-col">
                    <span>{platform.name}</span>
                    {platform.supported ? (
                      <span className="text-xs text-green-600 dark:text-green-400">Ready</span>
                    ) : (
                      <span className="text-xs text-gray-500">Coming Soon</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageTemplate>
  );
} 