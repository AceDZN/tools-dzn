'use client';

import { useState, useEffect, useCallback } from 'react'; // Ensure useCallback is imported if used
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
import {
  parseVideoUrl,
  getPlatformDisplayName,
  VideoPlatform,
  VideoQuality,
  VideoFormatType, // Ensured this matches the type definition
  VideoMetadata
} from '@/lib/video-downloader';
import { downloadVideo, getVideoMetadata } from './actions';
import { cn } from '@/lib/utils';
// React was already imported via useState, useEffect

interface DownloadState {
  isLoading: boolean;
  progress: number;
  error?: string;
  success?: boolean;
  downloadUrl?: string;
  videoTitle?: string;
  isMetadataLoading?: boolean;
}

// Helper to get display name for VideoQuality
function getVideoQualityDisplayName(quality: VideoQuality): string {
  const names: Record<VideoQuality, string> = {
    [VideoQuality.BEST]: 'Best Available',
    [VideoQuality.ULTRA_HD]: '4K (2160p)',
    [VideoQuality.Q_1440P]: '2K (1440p)',
    [VideoQuality.FULL_HD]: 'Full HD (1080p)',
    [VideoQuality.HIGH]: 'HD (720p)',
    [VideoQuality.MEDIUM]: 'SD (480p)',
    [VideoQuality.LOW]: 'Low (360p)',
    [VideoQuality.Q_240P]: 'Very Low (240p)',
    [VideoQuality.WORST]: 'Worst Available',
  };
  return names[quality] || quality;
}


export function VideoDownloaderTool() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<VideoQuality>(VideoQuality.BEST);
  const [format, setFormat] = useState<VideoFormatType>(VideoFormatType.MP4);
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isLoading: false,
    progress: 0,
    isMetadataLoading: false,
  });
  const [currentVideoMetadata, setCurrentVideoMetadata] = useState<VideoMetadata | null>(null); // Renamed for clarity
  const [currentAvailableQualities, setCurrentAvailableQualities] = useState<VideoQuality[] | null>(null); // Renamed for clarity

  const features = [
    {
      icon: <Video className="h-5 w-5 text-primary" />,
      title: 'Multiple Platforms',
      description: 'Support for YouTube & Twitter. More coming soon!',
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
    'Paste the video URL from YouTube or Twitter',
    'Select your preferred video quality and format',
    'Click download and wait for processing',
    'Save the video file to your device',
  ];

  const parsedUrlInfo = parseVideoUrl(url); // Memoize parseVideoUrl call

  useEffect(() => {
    const videoInfo = parseVideoUrl(url); // Re-parse or use memoized version for latest check

    if (videoInfo.isValid && videoInfo.videoId) {
      setDownloadState((prev): DownloadState => ({ ...prev, isMetadataLoading: true, error: undefined, success: false }));
      setCurrentVideoMetadata(null);
      setCurrentAvailableQualities(null);
      setQuality(VideoQuality.BEST); // Reset quality

      getVideoMetadata(url)
        .then(response => {
          if (response.success && response.data?.metadata) { // Check metadata existence
            const fetchedMetadata = response.data.metadata;
            setCurrentVideoMetadata(fetchedMetadata);

            // Ensure 'qualities' exists on metadata and is an array
            const qualitiesFromServer = fetchedMetadata.qualities;
            if (Array.isArray(qualitiesFromServer) && qualitiesFromServer.length > 0) {
              setCurrentAvailableQualities(qualitiesFromServer);
              // Set default quality to BEST if available, otherwise first in list
              if (qualitiesFromServer.includes(VideoQuality.BEST)) {
                setQuality(VideoQuality.BEST);
              } else {
                setQuality(qualitiesFromServer[0]);
              }
            } else {
              // Fallback if no specific qualities are listed, but video is valid
              setCurrentAvailableQualities([VideoQuality.BEST]);
              setQuality(VideoQuality.BEST);
            }

            if (fetchedMetadata.platform === VideoPlatform.TWITTER) {
              setFormat(VideoFormatType.MP4);
            }
          } else {
            // If success is false, or data/metadata is missing, but there's an error message in metadata
            if(response.data?.metadata?.error) {
                setDownloadState(prev => ({ ...prev, error: response.data.metadata.error }));
                setCurrentVideoMetadata(response.data.metadata); // still set metadata to show its error
            } else {
                setDownloadState(prev => ({ ...prev, error: response.error || 'Failed to fetch video metadata.' }));
                setCurrentVideoMetadata(null); // Clear metadata on general failure
            }
          }
        })
        .catch(err => {
          console.error("Error fetching metadata:", err);
          setDownloadState(prev => ({ ...prev, error: 'An unexpected error occurred while fetching metadata.' }));
          setCurrentVideoMetadata(null);
        })
        .finally(() => {
          setDownloadState(prev => ({ ...prev, isMetadataLoading: false }));
        });
    } else {
      // URL is not valid or no videoId
      setCurrentVideoMetadata(null);
      setCurrentAvailableQualities(null);
      if (url.trim() !== '' && !videoInfo.isValid) { // Only show parsing error if URL is not empty
        setDownloadState(prev => ({ ...prev, error: videoInfo.error || 'Invalid or unsupported URL', isMetadataLoading: false, success: false }));
      } else {
        setDownloadState((prev): DownloadState => ({ ...prev, error: undefined, isMetadataLoading: false, success: false  })); // Clear error if URL is empty
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // Simplified dependency: only re-run when the URL string itself changes. parseVideoUrl will be called within.

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      setDownloadState(prev => ({ ...prev, error: 'Failed to paste URL.'}));
    }
  };

  const handleDownload = async () => {
    // Use the memoized parsedUrlInfo for checks before download
    if (!parsedUrlInfo?.isValid || !parsedUrlInfo.videoId || currentVideoMetadata?.error) {
      setDownloadState(prev => ({
        ...prev,
        isLoading: false,
        error: currentVideoMetadata?.error || parsedUrlInfo?.error || 'Cannot download, video information is invalid or missing.',
      }));
      return;
    }

    setDownloadState((prev): DownloadState => ({ ...prev, isLoading: true, progress: 0, success: false, error: undefined }));

    try {
      const result = await downloadVideo({
        url,
        options: {
          quality,
          format: parsedUrlInfo.platform === VideoPlatform.TWITTER ? VideoFormatType.MP4 : format
        }
      });

      if (result.success && result.data?.downloadUrl) {
        const linkElement = document.createElement('a');
        linkElement.href = result.data.downloadUrl;
        linkElement.download = result.data.metadata?.title || 'video';
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);

        setDownloadState(prev => ({
          ...prev,
          isLoading: false,
          progress: 100,
          success: true,
          downloadUrl: result.data.downloadUrl, // Storing for potential future use
          videoTitle: result.data.metadata?.title
        }));

        setTimeout(() => {
          setDownloadState(prev => ({ ...prev, success: false, videoTitle: undefined }));
        }, 5000);
      } else {
        setDownloadState(prev => ({ ...prev, isLoading: false, error: result.error || 'Download failed. Please try again.' }));
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadState(prev => ({ ...prev, isLoading: false, error: 'Download failed due to an unexpected error.' }));
    }
  };

  const platformDisplayInfo = () => {
    if (downloadState.isMetadataLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Fetching video information...
        </div>
      );
    }
    if (currentVideoMetadata?.error) {
      return (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          Error: {currentVideoMetadata.error}
        </div>
      );
    }
    if (parsedUrlInfo?.isValid && currentVideoMetadata && currentVideoMetadata.platform !== VideoPlatform.UNKNOWN) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-green-500" />
          {getPlatformDisplayName(currentVideoMetadata.platform)} video detected
        </div>
      );
    }
    if (url.trim() !== '' && !parsedUrlInfo?.isValid && downloadState.error) {
        return (
            <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {downloadState.error}
            </div>
        );
    }
    return null;
  };

  const isTwitter = currentVideoMetadata?.platform === VideoPlatform.TWITTER;
  const canDownload = parsedUrlInfo?.isValid && !!currentVideoMetadata && !currentVideoMetadata.error;

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
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="video-url" className="text-sm font-medium">Video URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="video-url"
                      type="url"
                      placeholder="Paste video URL here (e.g., YouTube, Twitter)..."
                      value={url}
                      onChange={handleUrlChange}
                      className="pl-9"
                      disabled={downloadState.isLoading || downloadState.isMetadataLoading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePaste}
                    disabled={downloadState.isLoading || downloadState.isMetadataLoading}
                  >
                    Paste
                  </Button>
                </div>
                {platformDisplayInfo()}
              </div>

              {currentVideoMetadata && !currentVideoMetadata.error && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="quality" className="text-sm font-medium">Quality</label>
                    <Select
                      value={quality}
                      onValueChange={(value) => setQuality(value as VideoQuality)}
                      disabled={downloadState.isLoading || downloadState.isMetadataLoading || !currentAvailableQualities || currentAvailableQualities.length === 0}
                    >
                      <SelectTrigger id="quality">
                        <SelectValue placeholder="Select quality..." />
                      </SelectTrigger>
                      <SelectContent>
                        {currentAvailableQualities && currentAvailableQualities.length > 0 ? (
                          currentAvailableQualities.map((q) => (
                            <SelectItem key={q} value={q}>
                              {getVideoQualityDisplayName(q)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value={VideoQuality.BEST} disabled>Best Available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="format" className="text-sm font-medium">Format</label>
                    <Select
                      value={format}
                      onValueChange={(value) => setFormat(value as VideoFormatType)}
                      disabled={downloadState.isLoading || downloadState.isMetadataLoading || isTwitter}
                    >
                      <SelectTrigger id="format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={VideoFormatType.MP4}>MP4</SelectItem>
                        {!isTwitter && <SelectItem value={VideoFormatType.WEBM}>WebM</SelectItem>}
                      </SelectContent>
                    </Select>
                    {isTwitter && <p className="text-xs text-muted-foreground">Twitter videos are downloaded in MP4 format.</p>}
                  </div>
                </div>
              )}

              <Button
                onClick={handleDownload}
                disabled={!canDownload || downloadState.isLoading || downloadState.isMetadataLoading}
                className="w-full"
                size="lg"
              >
                {downloadState.isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing Video...</>
                ) : downloadState.success ? (
                  <><CheckCircle className="mr-2 h-4 w-4" />Download Prepared!</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" />Download Video</>
                )}
              </Button>

              {downloadState.success && downloadState.videoTitle && (
                <div className="space-y-2">
                  <div className="rounded-md bg-green-50 p-3 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <p className="text-sm font-medium">
                      Download for "{downloadState.videoTitle}" is ready. Your browser should prompt you to save the file.
                    </p>
                  </div>
                </div>
              )}

              {/* General download error not related to metadata */}
              {downloadState.error && !currentVideoMetadata?.error && !downloadState.isMetadataLoading && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{downloadState.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Supported Platforms</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { name: 'YouTube', icon: '🎬', supported: true },
                { name: 'Twitter/X', icon: '🐦', supported: true },
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
