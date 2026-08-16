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
  serverExternalPackages: ['@opentelemetry/sdk-node', '@opentelemetry/api', '@opentelemetry/core'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
