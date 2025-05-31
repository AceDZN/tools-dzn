'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToastNotifications } from '@/hooks/use-toast';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const toast = useToastNotifications();

  const updateOnlineStatus = useCallback(() => {
    const wasOnline = isOnline;
    const nowOnline = navigator.onLine;
    
    setIsOnline(nowOnline);

    // Show toast notifications on status change
    if (wasOnline && !nowOnline) {
      toast.warning(
        'You\'re offline',
        'Some features may be limited while offline.',
        { duration: 0 } // Don't auto-dismiss
      );
    } else if (!wasOnline && nowOnline) {
      toast.success(
        'Back online',
        'Your connection has been restored.',
        { duration: 3000 }
      );
    }
  }, [isOnline, toast]);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Set initial state
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [updateOnlineStatus]);

  return isOnline;
}

// Hook for checking if a feature requires online status
export function useRequiresOnline(featureName?: string) {
  const isOnline = useOnlineStatus();
  const toast = useToastNotifications();

  const checkOnline = useCallback(() => {
    if (!isOnline) {
      toast.error(
        'Internet connection required',
        featureName 
          ? `${featureName} requires an internet connection.`
          : 'This feature requires an internet connection.'
      );
      return false;
    }
    return true;
  }, [isOnline, featureName, toast]);

  return { isOnline, checkOnline };
} 