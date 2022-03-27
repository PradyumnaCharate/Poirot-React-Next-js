module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
            destination: 'https://https://pradyumna-poirot.netlify.app/:path*',
      },
    ]
  },
}


