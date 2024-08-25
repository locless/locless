/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
];

module.exports = {
  pageExtensions: ['tsx', 'mdx', 'ts', 'js'],
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
  redirects: () => [
    {
      source: '/docs',
      destination: 'https://locless.mintlify.app',
      permanent: true,
    },
    {
      source: '/docs/:match*',
      destination: 'https://locless.mintlify.app/:match*',
      permanent: true,
    },
  ],
};
