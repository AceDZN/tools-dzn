'use client';

import { Image, FileDown, Gauge, Layers } from 'lucide-react';
import { ToolPageTemplate } from '@/components/tools/tool-page-template';

export function ImageMinifierTool() {
  const features = [
    {
      icon: <Layers className="h-5 w-5 text-primary" />,
      title: 'Multiple Formats',
      description: 'Support for JPEG, PNG, WebP, and GIF formats',
    },
    {
      icon: <Gauge className="h-5 w-5 text-primary" />,
      title: 'Smart Compression',
      description: 'Intelligent algorithms to maintain quality',
    },
    {
      icon: <FileDown className="h-5 w-5 text-primary" />,
      title: 'Batch Processing',
      description: 'Compress multiple images at once',
    },
  ];

  const usageInstructions = [
    'Select or drag and drop images to compress',
    'Adjust quality settings if needed (optional)',
    'Click compress to start optimization',
    'Download compressed images individually or as a ZIP',
  ];

  return (
    <ToolPageTemplate
      title="Image Minifier"
      description="Compress images without losing quality"
      icon={<Image className="h-8 w-8 text-primary" />}
      features={features}
      usageInstructions={usageInstructions}
      isComingSoon={true}
    >
      {/* Tool implementation will go here */}
      <div className="space-y-4">
        {/* This will be implemented in a future task */}
      </div>
    </ToolPageTemplate>
  );
} 