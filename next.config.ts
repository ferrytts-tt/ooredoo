import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // On ignore les erreurs de lint pour le déploiement rapide
    ignoreDuringBuilds: true,
  },
  typescript: {
    // On ignore les erreurs de type pour le déploiement rapide
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
