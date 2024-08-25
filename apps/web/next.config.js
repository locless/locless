/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
];

module.exports = {
  transpilePackages: ['@repo/ui', '@repo/db', '@repo/id'],
  webpack: config => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', ...config.resolve.extensions];
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  rewrites: () => [
    {
      source: '/docs',
      destination: 'https://locless.mintlify.app',
    },
    {
      source: '/docs/:match*',
      destination: 'https://locless.mintlify.app/:match*',
    },
  ],
};
