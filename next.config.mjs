/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.43.58'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
}

export default nextConfig
