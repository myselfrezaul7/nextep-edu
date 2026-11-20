import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  // Prevent clickjacking - site cannot be framed by any origin
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Prevent MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Modern standard: disable deprecated and buggy browser XSS auditor
  {
    key: "X-XSS-Protection",
    value: "0",
  },
  // Control referrer information sent with requests
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // HTTP Strict Transport Security - force HTTPS
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Cross-Origin Isolation headers
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  // Content Security Policy - restrict what resources can load
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      [
        "script-src 'self' 'unsafe-inline'",
        isDev ? "'unsafe-eval'" : null,
        "https://va.vercel-scripts.com",
      ]
        .filter(Boolean)
        .join(" "),
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.web3forms.com https://wa.me https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com",
      "frame-src 'self' https://*.supabase.co blob:",
      "worker-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self' https://api.web3forms.com",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  // Permissions Policy - disable unused browser APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Prevent DNS prefetch abuse
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  // Apply security & caching headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [];
  },

  // Image optimization configuration tuned for 360px-430px phones and desktop
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [384, 480, 640, 750, 828, 1080, 1200, 1920],
    qualities: [65, 75],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  trailingSlash: false,

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
