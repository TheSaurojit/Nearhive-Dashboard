/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.contiki.com",
      },// remove it afterwards
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
        hostname: "images.ctfassets.net",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
