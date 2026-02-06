/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Questo comando crea la cartella 'out' che hai impostato
  images: {
    unoptimized: true, // Necessario per far funzionare le immagini nella cartella 'out'
  },
};

export default nextConfig;
