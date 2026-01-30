/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Apply security headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co https://*.paystack.com; style-src 'self' 'unsafe-inline' https://paystack.com https://*.paystack.com; img-src 'self' data: https:; font-src 'self' data: https://*.paystack.com; connect-src 'self' https://*.supabase.co https://api.paystack.co https://*.paystack.com; frame-src https://js.paystack.co https://checkout.paystack.com https://*.paystack.com;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
