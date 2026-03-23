import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is the default bundler in Next.js 16.
  // Node built-ins (fs, os, path, etc.) are automatically excluded from
  // browser bundles by Turbopack — no manual polyfill config needed.
  turbopack: {},
};

export default nextConfig;
