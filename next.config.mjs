/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rimuoviamo la configurazione i18n per ora per sbloccare il 404
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
};

export default nextConfig;
