/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', '10.204.229.144', '10.106.61.144', 'vercel.app', 'vercel.com'],
    unoptimized: true, // สำหรับ Vercel
  },
  // Enable experimental features for better mobile support
  experimental: {
    // esmExternals: false, // Removed as it's deprecated and causing issues
  },
  // Better mobile support
  poweredByHeader: false,
  compress: true,
  // PWA Configuration - Manual headers for manifest and service worker
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Vercel optimization
  trailingSlash: false,
}

module.exports = nextConfig
