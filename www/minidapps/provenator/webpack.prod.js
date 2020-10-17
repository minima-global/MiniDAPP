const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  plugins: [
    new webpack.DefinePlugin({
     'process.env': {
       'NODE_ENV': JSON.stringify('production')
      }
    }),
    new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
        },
    })
  ]
});
