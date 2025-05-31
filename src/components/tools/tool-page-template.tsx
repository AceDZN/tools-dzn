'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Share2, Copy, Twitter, Facebook, Linkedin, BookOpen, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToastNotifications } from '@/hooks/use-toast';

interface ToolFeature {
  icon: ReactNode;
  title: string;
  description: string;
}

interface ToolPageTemplateProps {
  title: string;
  description: string;
  icon: ReactNode;
  features?: ToolFeature[];
  usageInstructions?: string[];
  children: ReactNode;
  isComingSoon?: boolean;
}

export function ToolPageTemplate({
  title,
  description,
  icon,
  features = [],
  usageInstructions = [],
  children,
  isComingSoon = false,
}: ToolPageTemplateProps) {
  const pathname = usePathname();
  const toast = useToastNotifications();
  const toolUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Generate breadcrumb items
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...pathSegments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: '/' + pathSegments.slice(0, index + 1).join('/'),
    })),
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(toolUrl);
      toast.success('Link copied!', 'The tool link has been copied to your clipboard.');
    } catch (error) {
      toast.error('Failed to copy', 'Please try copying the URL manually.');
    }
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const text = `Check out ${title} - ${description}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(toolUrl);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="container py-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center">
              {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Tool Header */}
      <div className="mb-12">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-primary/10">
              {icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-lg text-muted-foreground">{description}</p>
            </div>
          </div>
          
          {/* Social Sharing */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              aria-label="Copy link"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare('twitter')}
              aria-label="Share on Twitter"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare('facebook')}
              aria-label="Share on Facebook"
            >
              <Facebook className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare('linkedin')}
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        {features.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    {feature.icon}
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Trust Indicators */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Fast Processing</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>Free to Use</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isComingSoon ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
                  <p className="text-muted-foreground">
                    This tool is currently under development. Check back soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            children
          )}
        </div>

        {/* Sidebar with Instructions */}
        <div className="space-y-6">
          {usageInstructions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {usageInstructions.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About This Tool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  All processing happens in your browser. Your files are never uploaded to our servers.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Optimized for speed with support for batch processing.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Support</h4>
                <p className="text-sm text-muted-foreground">
                  Need help? Check our FAQ or contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 