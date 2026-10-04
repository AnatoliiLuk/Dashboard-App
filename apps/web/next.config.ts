import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/types', '@repo/core', '@repo/api-client'],
};

export default nextConfig;
