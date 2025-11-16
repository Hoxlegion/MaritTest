import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  // Disable source maps in production for security
  productionBrowserSourceMaps: false,
  env: {
    DB_URL: process.env.DB_URL,
    DB_NAME: process.env.DB_NAME,
    DB_COLLECTION: process.env.DB_COLLECTION,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  }
};

export default withNextIntl(nextConfig);
