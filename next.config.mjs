/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable instrumentation for database initialization
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
