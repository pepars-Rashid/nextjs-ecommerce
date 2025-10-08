/** @type {import('next').NextConfig} */
const nextConfig = {
/* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.edgestore.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;