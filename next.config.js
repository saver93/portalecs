/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    // Riduci i warning sulla serializzazione
    config.infrastructureLogging = {
      level: 'error',
    }
    
    // Ignora i warning di critical dependency da Supabase Realtime
    config.module = {
      ...config.module,
      exprContextCritical: false,
    }
    
    return config
  },
}

module.exports = nextConfig
