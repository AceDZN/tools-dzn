'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Tools', href: '/tools', icon: '⚡' },
    { name: 'About', href: '/about', icon: '💫' },
    { name: 'Contact', href: '/contact', icon: '🚀' },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 glass dark:glass-dark">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 group">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary neon-glow-sm" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent animate-pulse" />
            </div>
            <span className="font-bold text-xl gradient-text">
              AceDZN Tools
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative transition-all duration-300 hover:text-primary px-2 py-1 rounded-md",
                  isActiveLink(item.href)
                    ? "text-primary font-semibold"
                    : "text-foreground/60"
                )}
              >
                <span className="flex items-center gap-1">
                  <span className="text-base">{item.icon}</span>
                  {item.name}
                </span>
                {isActiveLink(item.href) && (
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:inline-flex btn-futuristic border-primary/30 hover:border-primary"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Get Started
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass dark:glass-dark border-t border-primary/20">
          <nav className="flex flex-col space-y-2 px-4 pb-4 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-base font-medium rounded-md transition-all duration-300",
                  isActiveLink(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/60 hover:bg-primary/5 hover:text-primary"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
} 