const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const defaultResolve = require('metro-resolver').resolve;

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    ...defaultConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react-native-webview') {
        return {
          type: 'sourceFile',
          filePath: path.resolve(__dirname, 'node_modules/react-native-webview/index.js'),
        };
      }
      return defaultResolve(
        { ...context, resolveRequest: null },
        moduleName,
        platform
      );
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
