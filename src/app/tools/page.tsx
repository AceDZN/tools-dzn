import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Image, Scissors, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Tools',
  description: 'Browse our collection of free online tools for video downloading, image optimization, and more.',
};

const tools = [
  {
    title: 'Video Downloader',
    description: 'Download videos from YouTube, Twitter, Instagram, and Facebook with multiple quality options.',
    icon: Download,
    href: '/tools/video-downloader',
    status: 'Coming Soon',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
  {
    title: 'Image Minifier',
    description: 'Compress and optimize images in JPEG, PNG, and WebP formats while maintaining quality.',
    icon: Image,
    href: '/tools/image-minifier',
    status: 'Coming Soon',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  {
    title: 'Background Remover',
    description: 'Remove backgrounds from images automatically using AI-powered technology.',
    icon: Scissors,
    href: '/tools/background-remover',
    status: 'Coming Soon',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
  },
];

export default function ToolsPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">All Tools</h1>
          <p className="text-lg text-muted-foreground">
            Explore our growing collection of free online tools designed to make your digital workflow easier.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.href} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                      <Icon className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {tool.status}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {tool.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:bg-accent"
                    asChild
                  >
                    <Link href={tool.href}>
                      View Tool
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-2">More Tools Coming Soon</h2>
              <p className="text-muted-foreground mb-6">
                We're constantly adding new tools based on user feedback. Have a suggestion?
              </p>
              <Button>
                Request a Tool
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 