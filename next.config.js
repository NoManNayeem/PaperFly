/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/PaperFly',
  assetPrefix: '/PaperFly',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig

