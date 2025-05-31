import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, Image, Scissors, ArrowRight, Sparkles, Zap, Rocket, Globe, Code, Palette, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const tools = [
    {
      title: 'Video Downloader',
      description: 'Download videos from YouTube, Twitter, Instagram, and Facebook with multiple quality options.',
      icon: Download,
      href: '/tools/video-downloader',
      status: 'Coming Soon',
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    },
    {
      title: 'Image Minifier',
      description: 'Compress and optimize images in JPEG, PNG, and WebP formats while maintaining quality.',
      icon: Image,
      href: '/tools/image-minifier',
      status: 'Coming Soon',
      gradient: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
    },
    {
      title: 'Background Remover',
      description: 'Remove backgrounds from images automatically using AI-powered technology.',
      icon: Scissors,
      href: '/tools/background-remover',
      status: 'Coming Soon',
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed and performance',
      color: 'text-yellow-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data never leaves your browser',
      color: 'text-green-500',
    },
    {
      icon: Globe,
      title: 'Works Everywhere',
      description: 'Compatible with all modern browsers',
      color: 'text-blue-500',
    },
    {
      icon: Users,
      title: 'User Friendly',
      description: 'Intuitive interface for everyone',
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="container relative">
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
          <div className="absolute top-40 right-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />
        </div>

        <div className="flex flex-col items-center space-y-4 text-center relative">
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 px-4 py-2 text-sm font-medium">
            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold">
              Tools for Modern Workflows
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
            <span className="block">Powerful Tools for</span>
            <span className="block mt-2 gradient-text text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              Digital Creation
            </span>
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
            Transform, optimize, and enhance your digital assets with our collection of 
            professional-grade online tools. Fast, secure, and completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button size="lg" className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 btn-futuristic neon-pulse" asChild>
              <Link href="/tools">
                <Rocket className="mr-2 h-5 w-5" />
                Explore Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 border-primary/50 hover:bg-primary/10 btn-futuristic">
              <Code className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-2xl glass dark:glass-dark hover-lift cursor-pointer group"
              >
                <div className={`p-4 rounded-full ${feature.color} bg-current/10 mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tools Showcase */}
      <section className="py-12 md:py-24 relative">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            <span className="gradient-text">Featured Tools</span>
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
            Discover our most popular tools designed to streamline your creative workflow.
          </p>
        </div>
        
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={index} 
                className="group hover-lift border-primary/20 overflow-hidden relative"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${tool.gradient} transition-opacity duration-500`} />
                
                <CardHeader className="relative">
                  <div className="flex items-center space-x-2">
                    <div className={`p-3 rounded-xl ${tool.iconBg} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-white transition-colors">{tool.title}</CardTitle>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-foreground border border-purple-500/30">
                      {tool.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-sm leading-relaxed group-hover:text-white/90 transition-colors">
                    {tool.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="relative">
                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:bg-white/20 group-hover:text-white transition-all"
                    asChild
                  >
                    <Link href={tool.href}>
                      View Tool
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Demo Section - Showcasing UI Components */}
      <section className="py-12 md:py-24 relative">
        <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />
        
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            <span className="gradient-text">UI Component Showcase</span>
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
            Demonstrating our design system with interactive components and theme switching.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Button Variants */}
          <Card className="hover-lift border-primary/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-500" />
                Button Variants
              </CardTitle>
              <CardDescription>Different button styles and states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" className="btn-futuristic">Primary</Button>
                <Button variant="secondary" size="sm" className="btn-futuristic">Secondary</Button>
                <Button variant="outline" size="sm" className="btn-futuristic border-cyan-500/50 text-cyan-600 hover:bg-cyan-500/10">Outline</Button>
                <Button variant="ghost" size="sm" className="btn-futuristic hover:bg-pink-500/10 text-pink-600">Ghost</Button>
                <Button variant="success" size="sm" className="btn-futuristic bg-gradient-to-r from-green-500 to-emerald-500 text-white">Success</Button>
                <Button variant="destructive" size="sm" className="btn-futuristic">Danger</Button>
              </div>
            </CardContent>
          </Card>

          {/* Input Components */}
          <Card className="hover-lift border-primary/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-2xl" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-cyan-500" />
                Input Components
              </CardTitle>
              <CardDescription>Form inputs with validation states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Default input" 
                inputSize="sm"
                className="border-primary/30 focus:border-primary"
              />
              <Input 
                placeholder="Success state" 
                variant="success" 
                inputSize="sm"
                className="border-green-500/50"
              />
              <Input 
                placeholder="Error state" 
                error="This field is required"
                inputSize="sm"
                className="border-red-500/50"
              />
            </CardContent>
          </Card>

          {/* Theme Demo */}
          <Card className="hover-lift border-primary/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-2xl" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" />
                Theme System
              </CardTitle>
              <CardDescription>Light and dark mode support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <p className="text-sm">
                    The theme automatically adapts to your system preference and 
                    can be toggled manually using the button in the header.
                  </p>
                </div>
                <Button variant="outline" className="w-full btn-futuristic border-primary/30 hover:border-primary">
                  Check Header for Theme Toggle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 p-[1px]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 opacity-50 blur-xl" />
          <CardContent className="relative bg-background/95 backdrop-blur rounded-[calc(0.625rem-1px)] p-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                <span className="gradient-text">Ready to get started?</span>
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Join thousands of developers and designers who trust our tools for their projects.
              </p>
              <Button size="lg" className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 btn-futuristic neon-pulse" asChild>
                <Link href="/tools">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Using Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
