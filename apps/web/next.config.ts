import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/types', '@repo/core', '@repo/api-client'],
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
