/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=600' }],
      },
    ]
  },
}

export default nextConfig
