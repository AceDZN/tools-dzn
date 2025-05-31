import { Metadata } from 'next';
import { ImageMinifierTool } from './image-minifier-tool';
import { generateToolMetadata } from '@/components/tools/tool-page-wrapper';

export const metadata: Metadata = generateToolMetadata({
  title: 'Image Minifier',
  description: 'Compress and optimize images in JPEG, PNG, and WebP formats while maintaining quality. Reduce file sizes without losing visual quality.',
  keywords: ['image compressor', 'image optimizer', 'png compressor', 'jpeg optimizer', 'webp converter', 'image minifier'],
});

export default function ImageMinifierPage() {
  return <ImageMinifierTool />;
} 