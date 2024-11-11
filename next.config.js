module.exports = {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          stream: false,
          zlib: false,
        };
      }
      return config;
    },
  };  