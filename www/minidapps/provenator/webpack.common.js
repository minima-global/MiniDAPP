const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const htmlWebpackPlugin = require('html-webpack-plugin')
const htmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { CheckerPlugin } = require('awesome-typescript-loader')
const { TsConfigPathsPlugin } = require('awesome-typescript-loader')

var config = {
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  entry: {
    app: [
      '@babel/polyfill',
      './src/components/index.tsx'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'build')
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new htmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      inlineSource: '.(js|css)$'
    }),
    new htmlWebpackInlineSourcePlugin(),
    new CheckerPlugin(),
    new TsConfigPathsPlugin(/* { configFileName, compiler } */)
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        exclude: /node_modules/,
        enforce: "pre"
      },
      {
        test: /\.jsx?/,
        include: path.resolve(__dirname, 'app'),
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader"
      },
      {
        test: /\.(png|jpg|gif)$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 81920
            }
          }
        ]
      }
    ]
  }
}

module.exports = config
