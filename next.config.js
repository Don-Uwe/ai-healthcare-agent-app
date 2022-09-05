/** @type {import('next').NextConfig} */
const path = require('path')

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./src')
      // your aliases
    }

    return config
  }
}
