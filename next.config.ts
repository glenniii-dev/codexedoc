import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'e6ff5a2326b3b7dc48a6037d926dabdc.r2.cloudflarestorage.com',
        pathname: '/**', // allow all paths
      },
      {
        protocol: 'https',
        hostname: 'pub-19b6ce75af52489888c4ca4105e7a581.r2.dev',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
