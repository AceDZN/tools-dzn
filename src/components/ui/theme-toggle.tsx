'use client';

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
  variant?: 'button' | 'dropdown';
}

export function ThemeToggle({ 
  className, 
  showLabels = false, 
  variant = 'button' 
}: ThemeToggleProps) {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'dropdown') {
    return (
      <div className={cn(
        "relative inline-block text-left",
        className
      )}>
        <div className="group">
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-md p-2",
              "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "transition-colors duration-200"
            )}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {actualTheme === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          
          <div className={cn(
            "absolute right-0 z-10 mt-2 w-48 origin-top-right",
            "rounded-md bg-popover border border-border shadow-lg",
            "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100",
            "transition-all duration-200 ease-out",
            "invisible group-hover:visible"
          )}>
            <div className="py-1" role="menu">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "flex w-full items-center px-4 py-2 text-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-colors duration-150",
                  theme === 'light' && "bg-accent text-accent-foreground"
                )}
                role="menuitem"
              >
                <Sun className="mr-3 h-4 w-4" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "flex w-full items-center px-4 py-2 text-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-colors duration-150",
                  theme === 'dark' && "bg-accent text-accent-foreground"
                )}
                role="menuitem"
              >
                <Moon className="mr-3 h-4 w-4" />
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  "flex w-full items-center px-4 py-2 text-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-colors duration-150",
                  theme === 'system' && "bg-accent text-accent-foreground"
                )}
                role="menuitem"
              >
                <Monitor className="mr-3 h-4 w-4" />
                System
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "transition-colors duration-200",
        className
      )}
      aria-label={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} theme`}
    >
      {actualTheme === 'light' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      {showLabels && (
        <span className="ml-2 text-sm font-medium">
          {actualTheme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
} 