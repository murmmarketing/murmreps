/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  output: "standalone",
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.yupoo.com" },
      { protocol: "https", hostname: "img.weidian.com" },
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "**.taobaocdn.com" },
      { protocol: "https", hostname: "photo.yupoo.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 2592000,
    deviceSizes: [390, 640, 750, 1080, 1200],
    imageSizes: [64, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
