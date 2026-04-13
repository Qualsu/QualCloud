import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          hostname: "combative-moose-852.convex.site",
        },
        {
          hostname: "db.api.qual.su",
        },
        {
          hostname: "localhost",
        },
      ],
    },
};

export default nextConfig;
