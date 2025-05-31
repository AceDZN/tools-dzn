import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/theme-context';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ErrorBoundary } from '@/components/error-boundary';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'AceDZN Tools',
    template: '%s | AceDZN Tools',
  },
  description: 'A collection of useful online tools for developers and designers. Convert, optimize, and transform your digital assets with ease.',
  keywords: ['tools', 'online tools', 'developer tools', 'video downloader', 'image optimizer', 'background remover'],
  authors: [{ name: 'AceDZN' }],
  creator: 'AceDZN',
  metadataBase: new URL('https://tools.acedzn.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tools.acedzn.com',
    title: 'AceDZN Tools',
    description: 'A collection of useful online tools for developers and designers.',
    siteName: 'AceDZN Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AceDZN Tools',
    description: 'A collection of useful online tools for developers and designers.',
    creator: '@acedzn',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
    yandex: '',
    yahoo: '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="acedzn-theme"
        >
          <ErrorBoundary>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
