import { ReactNode } from 'react';
import { Metadata } from 'next';

interface ToolMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

export interface ToolPageWrapperProps {
  children: ReactNode;
  metadata: ToolMetadata;
}

/**
 * Generate metadata for a tool page
 */
export function generateToolMetadata(metadata: ToolMetadata): Metadata {
  const { title, description, keywords = [], ogImage } = metadata;
  
  return {
    title,
    description,
    keywords: ['online tools', 'free tools', ...keywords],
    openGraph: {
      title: `${title} | AceDZN Tools`,
      description,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | AceDZN Tools`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: `/tools/${title.toLowerCase().replace(/\s+/g, '-')}`,
    },
  };
}

/**
 * Server component wrapper for tool pages
 * This component should be used in the page.tsx files to wrap the client components
 */
export function ToolPageWrapper({ children }: ToolPageWrapperProps) {
  return <>{children}</>;
} 