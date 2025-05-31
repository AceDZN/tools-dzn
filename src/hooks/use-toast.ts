import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export function useToastNotifications() {
  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    description?: string,
    options?: ToastOptions
  ) => {
    const toastOptions: any = {};
    
    if (description !== undefined) {
      toastOptions.description = description;
    }
    
    if (options?.duration !== undefined) {
      toastOptions.duration = options.duration;
    }
    
    if (options?.action !== undefined) {
      toastOptions.action = options.action;
    }
    
    if (options?.onClose !== undefined) {
      toastOptions.onDismiss = options.onClose;
    }
    
    sonnerToast[type](title, toastOptions);
  };

  return {
    success: (title: string, description?: string, options?: ToastOptions) => {
      showToast('success', title, description, options);
    },
    error: (title: string, description?: string, options?: ToastOptions) => {
      showToast('error', title, description, options);
    },
    warning: (title: string, description?: string, options?: ToastOptions) => {
      showToast('warning', title, description, options);
    },
    info: (title: string, description?: string, options?: ToastOptions) => {
      showToast('info', title, description, options);
    },
  };
} 