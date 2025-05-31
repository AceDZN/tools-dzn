'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner, LoadingOverlay, Skeleton, ProgressBar, LoadingDots, CardSkeleton } from '@/components/ui/loading';
import { useToastNotifications } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useOnlineStatus, useRequiresOnline } from '@/hooks/use-online-status';
import { ValidationError, RateLimitError } from '@/lib/errors/validation-error';
import { retryWithStrategy } from '@/lib/utils/retry';

export default function ErrorHandlingDemo() {
  const toast = useToastNotifications();
  const { handleError } = useErrorHandler();
  const isOnline = useOnlineStatus();
  const { checkOnline } = useRequiresOnline('Demo feature');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSkeletons, setShowSkeletons] = useState(false);

  // Toast demos
  const showSuccessToast = () => {
    toast.success('Success!', 'Your action was completed successfully.');
  };

  const showErrorToast = () => {
    toast.error('Error occurred', 'Something went wrong. Please try again.');
  };

  const showWarningToast = () => {
    toast.warning('Warning', 'Please review your input before proceeding.');
  };

  const showInfoToast = () => {
    toast.info('Information', 'This is an informational message.');
  };

  const showActionToast = () => {
    toast.info('Action required', 'Click the action to proceed.', {
      action: {
        label: 'Take Action',
        onClick: () => {
          toast.success('Action taken!', 'The action was completed.');
        },
      },
    });
  };

  // Error handling demos
  const triggerValidationError = () => {
    try {
      throw new ValidationError('Please enter a valid email address', 'email');
    } catch (error) {
      handleError(error);
    }
  };

  const triggerRateLimitError = () => {
    try {
      throw new RateLimitError('Too many requests', 60);
    } catch (error) {
      handleError(error);
    }
  };

  const triggerNetworkError = () => {
    try {
      throw new Error('Failed to fetch data from server');
    } catch (error) {
      handleError(error);
    }
  };

  // Loading state demos
  const simulateLoading = async () => {
    setIsLoading(true);
    setProgress(0);
    
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsLoading(false);
    toast.success('Loading complete!');
  };

  // Retry mechanism demo
  const demonstrateRetry = async () => {
    let attempts = 0;
    
    try {
      await retryWithStrategy(async () => {
        attempts++;
        toast.info(`Attempt ${attempts}`, 'Trying to connect...');
        
        if (attempts < 3) {
          throw new Error('Connection failed');
        }
        
        return 'Success!';
      });
      
      toast.success('Connected!', 'Successfully connected after retries.');
    } catch (error) {
      handleError(error);
    }
  };

  // Offline check demo
  const checkOnlineStatus = () => {
    if (!checkOnline()) {
      return;
    }
    toast.success('Online!', 'You have an active internet connection.');
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Error Handling & Feedback Demo</h1>
          <p className="text-muted-foreground">
            Explore the error handling and user feedback components
          </p>
        </div>

        {/* Online Status */}
        <Card>
          <CardHeader>
            <CardTitle>Online Status</CardTitle>
            <CardDescription>
              Current status: {isOnline ? '🟢 Online' : '🔴 Offline'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkOnlineStatus}>
              Check Online Status
            </Button>
          </CardContent>
        </Card>

        {/* Toast Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
            <CardDescription>Different types of toast messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button onClick={showSuccessToast} variant="success">
                Success Toast
              </Button>
              <Button onClick={showErrorToast} variant="destructive">
                Error Toast
              </Button>
              <Button onClick={showWarningToast} variant="warning">
                Warning Toast
              </Button>
              <Button onClick={showInfoToast} variant="info">
                Info Toast
              </Button>
              <Button onClick={showActionToast} variant="outline">
                Action Toast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Handling */}
        <Card>
          <CardHeader>
            <CardTitle>Error Handling</CardTitle>
            <CardDescription>Trigger different types of errors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button onClick={triggerValidationError} variant="outline">
                Validation Error
              </Button>
              <Button onClick={triggerRateLimitError} variant="outline">
                Rate Limit Error
              </Button>
              <Button onClick={triggerNetworkError} variant="outline">
                Network Error
              </Button>
              <Button onClick={demonstrateRetry} variant="outline">
                Retry Mechanism
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Various loading indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
                <span className="text-sm text-muted-foreground">Spinners</span>
              </div>

              <div className="flex items-center gap-4">
                <LoadingDots />
                <span className="text-sm text-muted-foreground">Loading dots</span>
              </div>

              <div className="space-y-2">
                <ProgressBar value={progress} showLabel />
                <Button onClick={simulateLoading} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Start Progress'}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Skeleton Loading</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSkeletons(!showSkeletons)}
                >
                  {showSkeletons ? 'Hide' : 'Show'} Skeletons
                </Button>
              </div>

              {showSkeletons && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <CardSkeleton />
                </div>
              )}
            </div>

            <LoadingOverlay message="Processing your request...">
              <Card className="p-6">
                <p>This content has a loading overlay</p>
                <Button className="mt-2" disabled>
                  Disabled while loading
                </Button>
              </Card>
            </LoadingOverlay>
          </CardContent>
        </Card>

        {/* Error Boundary Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Error Boundary</CardTitle>
            <CardDescription>
              Error boundaries catch errors in child components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The error boundary component is wrapping the entire app and will catch any unhandled errors,
              displaying a user-friendly error page with options to retry or reload.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                throw new Error('This is a test error for the error boundary!');
              }}
            >
              Trigger Error Boundary
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 