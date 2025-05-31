'use client';

import { Scissors, Sparkles, Download, Eye } from 'lucide-react';
import { ToolPageTemplate } from '@/components/tools/tool-page-template';

export function BackgroundRemoverTool() {
  const features = [
    {
      icon: <Sparkles className="h-5 w-5 text-primary" />,
      title: 'AI-Powered',
      description: 'Advanced AI for accurate background detection',
    },
    {
      icon: <Eye className="h-5 w-5 text-primary" />,
      title: 'Preview & Edit',
      description: 'Fine-tune edges and preview before saving',
    },
    {
      icon: <Download className="h-5 w-5 text-primary" />,
      title: 'HD Export',
      description: 'Download in PNG format with transparency',
    },
  ];

  const usageInstructions = [
    'Upload an image with a clear subject',
    'Wait for AI to automatically remove the background',
    'Fine-tune edges if needed using the editor',
    'Download your image with transparent background',
  ];

  return (
    <ToolPageTemplate
      title="Background Remover"
      description="Remove image backgrounds with AI precision"
      icon={<Scissors className="h-8 w-8 text-primary" />}
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