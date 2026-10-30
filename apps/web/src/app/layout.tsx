import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'HTML Motion Studio Web — Convert HTML Animations Into Videos in Your Browser',
  description:
    'Import an HTML animation, preview it, add audio, and export a video without installing desktop software. Client-side, fast, and secure.',
  keywords: [
    'HTML to MP4',
    'HTML animation to video',
    'convert HTML to video',
    'browser video converter',
    'CSS animation to MP4',
    'SVG animation to video',
    'HTML Motion Studio',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HTML Motion Studio. All processing performed locally in your browser.</p>
        </footer>
      </body>
    </html>
  );
}

