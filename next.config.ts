import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.tractorjunction.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // <-- ADDED CLOUDINARY HERE
      },
    ],
  },
};

export default nextConfig;
