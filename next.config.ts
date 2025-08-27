/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
    
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "bonmasala.com",
      },
      {
        protocol: "https",
        hostname: "images.immediate.co.uk",
      },
        {
        protocol: "https",
        hostname: "www.dwarakaorganic.com",
      },
       {
        protocol: "https",
        hostname: "www.cubesnjuliennes.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
