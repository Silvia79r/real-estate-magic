/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supporto multilingua nativo
  i18n: {
    locales: ['it', 'en', 'de', 'fr'],
    defaultLocale: 'it',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'files.stripe.com' },
    ],
  },
};

export default nextConfig;
