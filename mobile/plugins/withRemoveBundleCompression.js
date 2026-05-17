const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withRemoveBundleCompression(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      config.modResults.contents = config.modResults.contents.replace(
        /enableBundleCompression\s*=\s*.*?\n/g,
        '// Removed enableBundleCompression by config plugin\n'
      );
    }
    return config;
  });
};
