import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "combative-moose-852.convex.site",
        },
        {
          protocol: "https",
          hostname: "db.api.qual.su",
          port: "8000",
          pathname: "/files/uploads/**",
        },
        {
          protocol: "https",
          hostname: "db.api.qual.su",
          port: "8005",
          pathname: "/files/**",
        },
        {
          hostname: "localhost",
          port: "3000",
        },
      ],
    },
};

export default nextConfig;