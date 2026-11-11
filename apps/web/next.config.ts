import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The floating dev badge covers content in /dev/ui screenshots.
  devIndicators: false,
  images: {
    // Dev placeholders are local SVGs; real listing photos will get remotePatterns later.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
