const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // In production builds, export static HTML into dist/ for Cloudflare Pages
  ...(isProd
    ? {
        output: 'export',
        distDir: 'dist',
      }
    : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        aggregateTimeout: 300,
        poll: false,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/.next/**',
          'D:/*.*',
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
