import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — HTML Motion Studio',
  description: 'Privacy Policy for HTML Motion Studio desktop application and web tools.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070a16] text-slate-200 py-16 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-semibold mb-4 inline-block">
            ← Back to HTML Motion Studio
          </Link>
          <h1 className="text-4xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-slate-400 text-sm mt-2">Last Updated: October 31, 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">1. Overview & 100% Offline Architecture</h2>
          <p className="text-slate-300 leading-relaxed">
            HTML Motion Studio (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;), created by TA Shanto, is designed from the ground up with a <strong>Local-First, Privacy-First architecture</strong>.
          </p>
          <p className="text-slate-300 leading-relaxed">
            When you use the HTML Motion Studio Desktop Application on Windows, macOS, or Linux:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 pl-4">
            <li><strong>Zero Cloud Uploads:</strong> Your HTML, CSS, JavaScript, canvas graphics, fonts, images, and audio files never leave your computer.</li>
            <li><strong>Local Frame Processing:</strong> Video frame stepping and encoding are performed entirely on your device via an isolated local Chromium instance and local FFmpeg.</li>
            <li><strong>No Tracking or Telemetry:</strong> We do not log your source code, your project files, or your exported videos.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">2. Information We Do Not Collect</h2>
          <p className="text-slate-300 leading-relaxed">
            We do not collect personal identifiable information (PII) such as your name, email address, passwords, or payment cards through the desktop app. No user account is required to use HTML Motion Studio.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">3. Third-Party Services & Web Fonts</h2>
          <p className="text-slate-300 leading-relaxed">
            If your imported HTML animation explicitly links to public external CDNs (such as Google Fonts or unpkg), your local browser runtime will request those public assets solely to render the preview. You may package all fonts and assets locally within a ZIP archive or project folder for complete offline rendering.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">4. Children&apos;s Privacy</h2>
          <p className="text-slate-300 leading-relaxed">
            HTML Motion Studio does not knowingly collect or solicit any personal information from children under 13.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">5. Contact Information</h2>
          <p className="text-slate-300 leading-relaxed">
            If you have any questions or feedback regarding this privacy policy or the application, please visit:
          </p>
          <p className="text-slate-300">
            Developer: <strong>TA Shanto</strong><br />
            Website: <a href="https://tashanto.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">tashanto.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}

