import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — only allow your own site to frame itself
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Prevent MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // XSS protection (legacy but still useful for older browsers)
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Control referrer information sent with requests
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // HTTP Strict Transport Security — force HTTPS for 2 years
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy — restrict what resources can load
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.web3forms.com https://wa.me",
      "frame-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self' https://api.web3forms.com",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  // Permissions Policy — disable unused browser APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Prevent DNS prefetch abuse
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Redirect HTTP to HTTPS (production)
  async redirects() {
    return [];
  },

  // Image optimization configuration
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false, // Remove "X-Powered-By: Next.js" header

  // Strict mode for catching bugs
  reactStrictMode: true,
};

export default nextConfig;
