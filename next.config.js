/** @type {import('next').NextConfig} */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = rawBasePath.endsWith('/') ? rawBasePath.slice(0, -1) : rawBasePath;

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
