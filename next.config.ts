import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Se estiver usando o plugin de PostCSS do Tailwind v4 */
  experimental: {
    // Caso use Turbopack, o suporte ao v4 é nativo. 
    // Se usar Webpack, garanta que o plugin de PostCSS esteja ok.
  },
};

export default nextConfig;