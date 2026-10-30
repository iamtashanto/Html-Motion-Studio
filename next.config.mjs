/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Headers for cross-origin isolation if needed for high performance timers or workers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

