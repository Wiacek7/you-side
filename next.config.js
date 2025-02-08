/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@orbisclub/components'], // Fix transpilation issues
  images: {
    unoptimized: true,
    domains: ['orbis.mypinata.cloud', 'ipfs.io', 'gateway.ipfs.io']
  },
  headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
