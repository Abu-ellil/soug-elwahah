/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
 },
  images: {
    domains: ['localhost', 'your-api-domain.com'], // Add your image domains here
  },
};

module.exports = nextConfig;