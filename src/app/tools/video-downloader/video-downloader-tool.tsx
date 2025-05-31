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
import {
  parseVideoUrl,
  getPlatformDisplayName,
  VideoPlatform,
  VideoQuality,
  VideoFormatType, // Updated type name
  VideoMetadata // For state type
} from '@/lib/video-downloader';
import { downloadVideo, getVideoMetadata } from './actions'; // Import getVideoMetadata
import { cn } from '@/lib/utils';
import React, { useEffect } from 'react'; // Import useEffect

interface DownloadState {
  isLoading: boolean;
  progress: number;
  error?: string;
  success?: boolean;
  downloadUrl?: string;
  videoTitle?: string;
  isMetadataLoading?: boolean; // For metadata loading state
}

export function VideoDownloaderTool() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<VideoQuality>(VideoQuality.BEST); // Default to BEST
  const [format, setFormat] = useState<VideoFormatType>(VideoFormatType.MP4);
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isLoading: false,
    progress: 0,
    isMetadataLoading: false,
  });
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [availableQualities, setAvailableQualities] = useState<VideoQuality[] | null>(null);


  const features = [
    {
      icon: <Video className="h-5 w-5 text-primary" />,
      title: 'Multiple Platforms',
      description: 'Support for YouTube & Twitter. More coming soon!', // Updated description
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
    'Paste the video URL from YouTube or Twitter', // Updated
    'Select your preferred video quality and format',
    'Click download and wait for processing',
    'Save the video file to your device',
  ];

  const parsedVideoInfo = url ? parseVideoUrl(url) : null;

  useEffect(() => {
    if (parsedVideoInfo?.isValid && parsedVideoInfo.videoId) {
      setDownloadState(prev => ({ ...prev, isMetadataLoading: true, error: undefined }));
      setVideoMetadata(null);
      setAvailableQualities(null);
      setQuality(VideoQuality.BEST); // Reset quality on new URL

      getVideoMetadata(url)
        .then(response => {
          if (response.success && response.data) {
            setVideoMetadata(response.data.metadata);
            if (response.data.metadata.qualities && response.data.metadata.qualities.length > 0) {
              setAvailableQualities(response.data.metadata.qualities);
              // Set default quality to BEST or the first available if BEST is not in the list
              if (response.data.metadata.qualities.includes(VideoQuality.BEST)) {
                setQuality(VideoQuality.BEST);
              } else {
                setQuality(response.data.metadata.qualities[0]);
              }
            } else {
               // If no specific qualities, provide default "BEST"
              setAvailableQualities([VideoQuality.BEST]);
              setQuality(VideoQuality.BEST);
            }
            // Handle platform-specific format defaults
            if (response.data.metadata.platform === VideoPlatform.TWITTER) {
              setFormat(VideoFormatType.MP4);
            }
          } else {
            setDownloadState(prev => ({ ...prev, error: response.error || 'Failed to fetch video metadata.' }));
            setVideoMetadata(response.data?.metadata || null); // Store metadata even if there's an error within it
          }
        })
        .catch(err => {
          console.error("Error fetching metadata:", err);
          setDownloadState(prev => ({ ...prev, error: 'An unexpected error occurred while fetching metadata.' }));
        })
        .finally(() => {
          setDownloadState(prev => ({ ...prev, isMetadataLoading: false }));
        });
    } else {
      setVideoMetadata(null);
      setAvailableQualities(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, parsedVideoInfo?.videoId]); // Rerun when URL or extracted videoId changes

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear any previous download/metadata errors when user types
    setDownloadState({ isLoading: false, progress: 0, isMetadataLoading: false, error: undefined });
    setVideoMetadata(null);
    setAvailableQualities(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setDownloadState({ isLoading: false, progress: 0, isMetadataLoading: false, error: undefined });
      setVideoMetadata(null);
      setAvailableQualities(null);
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  };

  const handleDownload = async () => {
    if (!parsedVideoInfo?.isValid || !parsedVideoInfo.videoId) {
      setDownloadState({
        isLoading: false,
        progress: 0,
        error: parsedVideoInfo?.error || 'Invalid URL',
      });
      return;
    }

    setDownloadState({ isLoading: true, progress: 0, success: false, error: undefined });

    try {
      const result = await downloadVideo({
        url,
        options: {
          quality,
          format: parsedVideoInfo.platform === VideoPlatform.TWITTER ? VideoFormatType.MP4 : format
        }
      });

      if (result.success && result.data?.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = result.data.metadata?.title || 'video';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadState({
          isLoading: false,
          progress: 100,
          success: true,
          downloadUrl: result.data.downloadUrl,
          videoTitle: result.data.metadata?.title
        });
        
        setTimeout(() => {
          setDownloadState(prev => ({ ...prev, isLoading: false, progress: 0, success: false }));
        }, 5000);
      } else {
        setDownloadState({
          isLoading: false,
          progress: 0,
          error: result.error || 'Download failed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadState({
        isLoading: false,
        progress: 0,
        error: 'Download failed due to an unexpected error.',
      });
    }
  };

  const platformIcon = parsedVideoInfo?.isValid && parsedVideoInfo.platform !== VideoPlatform.UNKNOWN ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <CheckCircle className="h-4 w-4 text-green-500" />
      {getPlatformDisplayName(parsedVideoInfo.platform)} video detected
      {/* Removed (coming soon) for Twitter */}
    </div>
  ) : parsedVideoInfo && !parsedVideoInfo.isValid ? (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      {parsedVideoInfo.error || 'Invalid or unsupported URL'}
    </div>
  ) : null;


  const isTwitterVideo = videoMetadata?.platform === VideoPlatform.TWITTER;

  return (
    <ToolPageTemplate
      title="Video Downloader"
      description="Download videos from popular social media platforms"
      icon={<Download className="h-8 w-8 text-primary" />}
      features={features}
      usageInstructions={usageInstructions}
      isComingSoon={false} // Main tool is not coming soon
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
                {platformIcon}
                {downloadState.isMetadataLoading && (
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <Loader2 className="h-4 w-4 animate-spin" />
                     Fetching video information...
                   </div>
                )}
                {videoMetadata?.error && !downloadState.isMetadataLoading && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Error: {videoMetadata.error}
                  </div>
                )}
              </div>

              {videoMetadata && !videoMetadata.error && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="quality" className="text-sm font-medium">Quality</label>
                    <Select
                      value={quality}
                      onValueChange={(value) => setQuality(value as VideoQuality)}
                      disabled={downloadState.isLoading || downloadState.isMetadataLoading || !availableQualities || availableQualities.length === 0}
                    >
                      <SelectTrigger id="quality">
                        <SelectValue placeholder="Select quality..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableQualities ? availableQualities.map((q) => (
                          <SelectItem key={q} value={q}>
                            {`${q.charAt(0).toUpperCase() + q.slice(1)}p`.replace('pP', 'P').replace('Bestp', 'Best Available').replace('Worstp', 'Worst Available').replace('Highp', 'HD (720p)').replace('Full_hdp', 'Full HD (1080p)').replace('Q_1440pp', '2K (1440p)').replace('Ultra_hdp', '4K (2160p)').replace('Mediump', 'SD (480p)').replace('Lowp', 'Low (360p)').replace('Q_240pp', 'Very Low (240p)')}
                          </SelectItem>
                        )) : <SelectItem value={VideoQuality.BEST} disabled>Best Available</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="format" className="text-sm font-medium">Format</label>
                    <Select
                      value={format}
                      onValueChange={(value) => setFormat(value as VideoFormatType)}
                      disabled={downloadState.isLoading || downloadState.isMetadataLoading || isTwitterVideo}
                    >
                      <SelectTrigger id="format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={VideoFormatType.MP4}>MP4</SelectItem>
                        {!isTwitterVideo && <SelectItem value={VideoFormatType.WEBM}>WebM</SelectItem>}
                        {/* Add other formats if supported by other platforms and yt-dlp */}
                      </SelectContent>
                    </Select>
                    {isTwitterVideo && <p className="text-xs text-muted-foreground">Twitter videos are downloaded in MP4 format.</p>}
                  </div>
                </div>
              )}

              <Button
                onClick={handleDownload}
                disabled={!url || !videoMetadata || !!videoMetadata.error || downloadState.isLoading || downloadState.isMetadataLoading}
                className="w-full"
                size="lg"
              >
                {downloadState.isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing Video...</>
                ) : downloadState.success ? (
                  <><CheckCircle className="mr-2 h-4 w-4" />Download Complete!</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" />Download Video</>
                )}
              </Button>

              {downloadState.success && downloadState.videoTitle && (
                <div className="space-y-2">
                  <div className="rounded-md bg-green-50 p-3 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <p className="text-sm font-medium">
                      Successfully prepared download for: {downloadState.videoTitle}
                    </p>
                  </div>
                </div>
              )}

              {downloadState.error && (
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
                { name: 'Twitter/X', icon: '🐦', supported: true }, // Updated
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