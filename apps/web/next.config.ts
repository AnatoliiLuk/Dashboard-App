import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/types', '@repo/core'],
};

export default nextConfig;
