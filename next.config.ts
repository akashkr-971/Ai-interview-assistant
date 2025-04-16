import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pyvudipoynpodijwuygx.supabase.co', 
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
