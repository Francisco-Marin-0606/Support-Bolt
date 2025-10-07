/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return [
      {
        source: "/api/:path*",
        destination: `https://mmg-support-api-7wrlg.ondigitalocean.app/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
