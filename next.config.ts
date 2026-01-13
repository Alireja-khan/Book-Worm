import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com"
      },
      { hostname: "res.cloudinary.com" },
      { hostname: "images-na.ssl-images-amazon.com"}

    ]
  }
};

export default nextConfig;