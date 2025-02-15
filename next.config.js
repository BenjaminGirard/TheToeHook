/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'api.openbeta.io',
      'cdn.openbeta.io',
      'mountainproject.com',
      'www.mountainproject.com',
      'image.thecrag.com',
      'commons.wikimedia.org',
      'images.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.thecrag.com',
      },
      {
        protocol: 'https',
        hostname: '**.mountainproject.com',
      },
      {
        protocol: 'https',
        hostname: '**.openbeta.io',
      },
      {
        protocol: 'https',
        hostname: '**.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      }
    ]
  }
};

module.exports = nextConfig; 