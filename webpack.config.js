var webpack = require('webpack');
var path = require('path');

var createGlobChunk = require('./webpack-glob-chunk');

module.exports = {
  entry: {
    app: './app/main.js',
  },

  output: {
    path: 'build/',
    filename: '[name].bundle.js'
  },

  resolve: {
    root: path.resolve('./node_modules')
  },

  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },

  plugins: [
    createGlobChunk({
      name: 'vendor',

      patterns: [
        './node_modules/**/*.js',
        './vendor/**/*.js'
      ]
    })

    // XXX: this doesn't work yet and I don't know why not :(
    // createGlobChunk({
    //   name: 'data',
    //
    //   patterns: [
    //     './songs#<{(||)}>#*'
    //   ],
    // })
  ],

  devtool: 'source-map',

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules\/)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
          plugins: ['syntax-async-functions', 'transform-object-rest-spread', 'transform-regenerator']
        }
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      },
      {
        test: /(?:\.woff$|\.woff2$|\.ttf$|\.svg$|\.eot$)/,
        loader: 'file-loader',
        query: {
          name: '/font/[hash].[ext]'
        }
      },
      {
        test: /(?:\.mp3)/,
        loader: 'file-loader',
        query: {
          name: '/assets/[hash].[ext]'
        }
      },
      {
        test: /(?:\.json)/,
        loader: 'json-loader'
      }

    ]
  },

  devServer: {
    historyApiFallback: true,
  },
};
