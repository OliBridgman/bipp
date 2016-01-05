var webpack = require('webpack');

var defaultConfig = require('./webpack/test');

var webpackConfig = {
  devtool: 'inline-source-map',

  module: defaultConfig.module,

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"test"'
      }
    })
  ],
};

module.exports = function(config) {
  config.set({

    browsers: ['Chrome'],
    frameworks: ['mocha'],
    reporters: ['mocha'],

    files: [
      'app/__tests__/index.js',
    ],

    preprocessors: {
      'app/__tests__/index.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackServer: {
      noInfo: true,
    },
  });
};
