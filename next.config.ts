import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/overview",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
