import { Metadata } from 'next';
import { BackgroundRemoverTool } from './background-remover-tool';
import { generateToolMetadata } from '@/components/tools/tool-page-wrapper';

export const metadata: Metadata = generateToolMetadata({
  title: 'Background Remover',
  description: 'Remove backgrounds from images automatically using AI-powered technology. Perfect for product photos, portraits, and creative designs.',
  keywords: ['background remover', 'remove bg', 'transparent background', 'AI background removal', 'image editor'],
});

export default function BackgroundRemoverPage() {
  return <BackgroundRemoverTool />;
} 