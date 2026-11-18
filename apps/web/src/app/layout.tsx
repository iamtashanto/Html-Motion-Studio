import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Heart } from 'lucide-react';

export const metadata: Metadata = {
  metadataBase: new URL('https://htmlmotionstudio.tashanto.com'),
  title: {
    default: 'HTML Motion Studio — Rust-Powered High-Performance HTML to MP4 Video Studio',
    template: '%s | HTML Motion Studio',
  },
  description:
    'Convert HTML5, CSS, SVG, Canvas, and WebGL animations into deterministic 4K 60fps MP4, WebM, and ProRes videos. Instant browser studio + ultra-fast v2.0 Native Rust Core (1.5 MB SwiftUI macOS & Slint Windows/Linux).',
  keywords: [
    'HTML to MP4',
    'HTML animation to video',
    'Rust HTML to video converter',
    'high performance HTML video renderer',
    'SwiftUI macOS HTML to MP4',
    'Slint Rust desktop video studio',
    'zero-disk FFmpeg pipe',
    'convert HTML to video',
    'CSS animation to MP4',
    'Canvas to 4K 60fps MP4',
    'SVG animation to video',
    'deterministic Chromium CDP rendering',
    'HTML Motion Studio',
    'WebCodecs video converter',
  ],
  authors: [{ name: 'TA Shanto', url: 'https://tashanto.com' }],
  creator: 'TA Shanto',
  publisher: 'HTML Motion Studio',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://htmlmotionstudio.tashanto.com',
    siteName: 'HTML Motion Studio',
    title: 'HTML Motion Studio — Rust-Powered High-Performance HTML to Video Converter',
    description:
      'Transform HTML5, CSS, Canvas, and WebGL animations into frame-accurate 4K 60fps videos. Run instantly in your browser or download our 1.5 MB Native Rust + SwiftUI Desktop Studio.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HTML Motion Studio — Rust High-Performance HTML to Video Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HTML Motion Studio v2.0 — Rust-Powered HTML to 4K 60fps Video Studio',
    description:
      'Convert HTML, CSS, SVG, and Canvas animations into deterministic MP4, WebM, and ProRes videos. Instant Web Studio + 1.5 MB Native Rust & SwiftUI Desktop App.',
    images: ['/og-image.png'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'HTML Motion Studio Web',
        url: 'https://htmlmotionstudio.tashanto.com',
        description:
          'In-browser converter for transforming HTML, CSS, SVG, and JavaScript animations into downloadable MP4 and WebM videos with 100% client-side privacy.',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All modern web browsers (Chrome, Edge, Firefox, Safari)',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Single HTML & ZIP archive import',
          'Hardware-accelerated WebCodecs video encoding',
          'Audio soundtrack mixing and synchronization',
          'Zero server upload client-side execution',
          'Multi-aspect ratio support (16:9, 9:16, 1:1, 4:5)',
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'HTML Motion Studio Native',
        softwareVersion: '2.0.0',
        url: 'https://htmlmotionstudio.tashanto.com/download',
        downloadUrl: 'https://github.com/iamtashanto/Html-Motion-Studio/releases/tag/v2.0.0',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'macOS 14+ (Apple Silicon), Windows 10/11 (x64), Linux (x64)',
        fileSize: '1.5 MB (macOS SwiftUI ZIP)',
        description:
          'High-performance native desktop studio built on a shared Rust core engine with pure SwiftUI on macOS and GPU-accelerated Slint UI on Windows & Linux. Features zero-disk-I/O FFmpeg piping, deterministic Chromium CDP frame stepping, and native SQLite persistence.',
        author: {
          '@type': 'Person',
          name: 'TA Shanto',
          url: 'https://tashanto.com',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Shared high-performance Rust core engine (hms-core)',
          'Pure SwiftUI + AppKit + WKWebView macOS native app (1.5 MB ZIP)',
          'GPU-accelerated Rust Slint native UI for Windows & Linux',
          'Zero-disk-I/O FFmpeg stdin streaming pipe (H.264, VP9, ProRes 4444)',
          'Deterministic Chromium CDP frame stepping for 4K 60fps exports',
          'Bundled native SQLite (rusqlite) project & export history',
        ],
      },
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <p>© {new Date().getFullYear()} HTML Motion Studio. Web &amp; Native Rust v2.0 Suite.</p>
              <span className="hidden sm:inline text-slate-700">•</span>
              <p className="text-slate-400">
                Developed by{' '}
                <a
                  href="https://tashanto.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-400 hover:text-blue-300 hover:underline transition"
                >
                  TA Shanto
                </a>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/tools/html-to-mp4" className="hover:text-slate-300 transition">
                HTML to MP4 Converter
              </a>
              <span className="text-slate-700">•</span>
              <a href="/download" className="hover:text-slate-300 transition">
                Native Desktop v2.0
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="https://tashanto.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 font-semibold transition"
              >
                tashanto.com
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="https://www.supportkori.com/iamtashanto"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 font-semibold transition"
                title="Support on SupportKori"
              >
                <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                <span>Support</span>
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
