/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
