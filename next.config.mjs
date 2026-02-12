/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure client components work properly
  reactStrictMode: true,
  
  // Webpack configuration for canvas libraries
  webpack: (config, { isServer }) => {
    // Handle canvas module (required for Matter.js on server)
    if (isServer) {
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }
    
    return config;
  },
  
  // Ensure proper image loading
  images: {
    domains: [],
    unoptimized: false,
  },
};

export default nextConfig;
