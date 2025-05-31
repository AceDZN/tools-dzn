import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long');

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .max(2048, 'URL is too long')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'URL must use HTTP or HTTPS protocol' }
  );

export const fileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required').max(255, 'File name is too long'),
  size: z.number().min(1, 'File size must be greater than 0').max(100 * 1024 * 1024, 'File size must be less than 100MB'),
  type: z.string().min(1, 'File type is required'),
});

// Video downloader validation
export const videoDownloadSchema = z.object({
  url: urlSchema.refine(
    (url) => {
      const domain = new URL(url).hostname.toLowerCase();
      const supportedDomains = [
        'youtube.com',
        'youtu.be',
        'twitter.com',
        'x.com',
        'instagram.com',
        'facebook.com',
        'fb.watch'
      ];
      return supportedDomains.some(d => domain.includes(d));
    },
    { message: 'URL must be from a supported platform (YouTube, Twitter, Instagram, Facebook)' }
  ),
  quality: z.enum(['highest', 'high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Please select a valid quality option' })
  }).optional().default('high'),
  format: z.enum(['mp4', 'webm', 'mp3'], {
    errorMap: () => ({ message: 'Please select a valid format option' })
  }).optional().default('mp4'),
});

// Image processing validation
export const imageProcessingSchema = z.object({
  file: fileUploadSchema.refine(
    (file) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      return allowedTypes.includes(file.type);
    },
    { message: 'File must be a valid image (JPEG, PNG, WebP, or GIF)' }
  ),
  quality: z.number().min(1, 'Quality must be at least 1').max(100, 'Quality must be at most 100').optional().default(80),
  width: z.number().min(1, 'Width must be at least 1 pixel').max(10000, 'Width must be at most 10000 pixels').optional(),
  height: z.number().min(1, 'Height must be at least 1 pixel').max(10000, 'Height must be at most 10000 pixels').optional(),
  format: z.enum(['jpeg', 'png', 'webp'], {
    errorMap: () => ({ message: 'Please select a valid output format' })
  }).optional(),
});

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  ip: z.string().ip('Invalid IP address'),
  userAgent: z.string().max(500, 'User agent is too long').optional(),
  endpoint: z.string().min(1, 'Endpoint is required').max(100, 'Endpoint name is too long'),
});

// Text input sanitization schema
export const sanitizedTextSchema = z
  .string()
  .max(10000, 'Text is too long')
  .transform((str) => str.trim())
  .refine((str) => str.length > 0, { message: 'Text cannot be empty' });

// Common pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(10),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Search query is too long'),
  category: z.string().max(50, 'Category is too long').optional(),
});

// File validation utilities
export const validateFileType = (allowedTypes: string[]) => {
  return z.string().refine(
    (type) => allowedTypes.includes(type),
    { message: `File type must be one of: ${allowedTypes.join(', ')}` }
  );
};

export const validateFileSize = (maxSizeInBytes: number) => {
  return z.number().max(maxSizeInBytes, `File size must be less than ${Math.round(maxSizeInBytes / (1024 * 1024))}MB`);
};

// URL validation for specific domains
export const createDomainUrlSchema = (allowedDomains: string[]) => {
  return urlSchema.refine(
    (url) => {
      try {
        const domain = new URL(url).hostname.toLowerCase();
        return allowedDomains.some(d => domain.includes(d));
      } catch {
        return false;
      }
    },
    { message: `URL must be from: ${allowedDomains.join(', ')}` }
  );
}; 