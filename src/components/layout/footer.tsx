import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Zap, Sparkles, Github, Twitter, Heart } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(
      "relative border-t border-primary/20 glass dark:glass-dark overflow-hidden",
      className
    )}>
      {/* Gradient accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container relative py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4 group">
              <div className="relative">
                <Zap className="h-8 w-8 text-primary neon-glow-sm" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent animate-pulse" />
              </div>
              <span className="font-bold text-lg gradient-text">
                AceDZN Tools
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              A collection of powerful, futuristic online tools for developers and designers. 
              Transform your digital assets with cutting-edge technology.
            </p>
          </div>

          {/* Tools section */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Tools
              </span>
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/tools/video-downloader" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                  Video Downloader
                </Link>
              </li>
              <li>
                <Link 
                  href="/tools/image-minifier" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                  Image Minifier
                </Link>
              </li>
              <li>
                <Link 
                  href="/tools/background-remover" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                  Background Remover
                </Link>
              </li>
            </ul>
          </div>

          {/* Company section */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-lg">🚀</span>
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Company
              </span>
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/about" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-6 border-t border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            © {currentYear} AceDZN Tools. Made with 
            <Heart className="h-4 w-4 text-pink-500 fill-pink-500 animate-pulse" />
            by AceDZN
          </p>
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 