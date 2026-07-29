import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: [
    '@litetrace/core',
    '@litetrace/db',
    '@litetrace/ingest',
    '@litetrace/queue',
    '@litetrace/config',
    '@litetrace/observability',
    '@litetrace/types',
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
