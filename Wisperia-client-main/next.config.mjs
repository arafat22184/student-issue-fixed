/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // শুধুমাত্র ক্লায়েন্ট-সাইড (Browser) এর জন্য এই কনফিগারেশন
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        dns: false,
        tls: false,
        child_process: false,
        "mongodb-client-encryption": false,
        snappy: false,
        kerberos: false,
        "@aws-sdk/credential-providers": false,
        "gcp-metadata": false,
        socks: false,
      };
    }
    return config;
  },
};

export default nextConfig;