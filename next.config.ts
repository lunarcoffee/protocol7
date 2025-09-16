import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: 'https://csclub.uwaterloo.ca/~fsygao/protocol7/',
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
