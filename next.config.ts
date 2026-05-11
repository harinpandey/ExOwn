import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/marketplace',
        destination: '/search',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
