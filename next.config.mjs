/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rimuoviamo output: 'export' se presente
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
