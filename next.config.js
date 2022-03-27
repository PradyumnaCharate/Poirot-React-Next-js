module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
            destination: 'https://pradyumna-poirot.netlify.app/:path*',
      },
    ]
  },
}


