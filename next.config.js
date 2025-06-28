/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true }, // needed if you use next/image
  basePath: '/mug-3D',  // 👈 important
  assetPrefix: '/mug-3D',
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
}

module.exports = nextConfig
