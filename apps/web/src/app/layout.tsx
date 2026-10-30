import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  metadataBase: new URL('https://htmlmotionstudio.tashanto.com'),
  title: {
    default: 'HTML Motion Studio Web — Convert HTML Animations Into Videos in Your Browser',
    template: '%s | HTML Motion Studio',
  },
  description:
    'HTML Motion Studio converts HTML, CSS, and JavaScript animations into downloadable videos right in your browser. 100% private, client-side, with audio mixing.',
  keywords: [
    'HTML to MP4',
    'HTML animation to video',
    'convert HTML to video',
    'browser video converter',
    'CSS animation to MP4',
    'SVG animation to video',
    'HTML Motion Studio',
    'WebCodecs video converter',
  ],
  authors: [{ name: 'HTML Motion Studio Team' }],
  creator: 'HTML Motion Studio',
  publisher: 'HTML Motion Studio',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://htmlmotionstudio.tashanto.com',
    siteName: 'HTML Motion Studio',
    title: 'Convert HTML Animations Into Videos — Right in Your Browser',
    description:
      'Import an HTML animation, preview it, add audio, and export a video without installing desktop software. Client-side, fast, and secure.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HTML Motion Studio Web Converter Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HTML Motion Studio Web — In-Browser HTML to Video Converter',
    description:
      'Convert HTML, CSS, SVG, and Canvas animations into MP4 videos directly in your browser with synchronized audio.',
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
    '@type': 'WebApplication',
    name: 'HTML Motion Studio Web',
    url: 'https://htmlmotionstudio.tashanto.com',
    description:
      'In-browser converter for transforming HTML, CSS, SVG, and JavaScript animations into downloadable MP4 and WebM videos.',
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
              <p>© {new Date().getFullYear()} HTML Motion Studio. All processing performed locally in your browser.</p>
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
                Desktop App
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
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
