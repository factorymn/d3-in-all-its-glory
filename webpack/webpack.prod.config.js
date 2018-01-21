var path = require('path');
var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var rootPath = path.resolve(__dirname , '..');
var outPath = path.resolve(__dirname, '../build');

module.exports = {
  context: path.resolve(__dirname , '..'),
  devtool: 'source-map',
  entry: [
    './src/app.js'
  ],
  output: {
    path: outPath,
    filename: '[name].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      },
      {
        test: /\.styl|\.css/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                localIdentName: '[local]',
                sourceMap: true
              }
            },
            {
              loader: 'autoprefixer-loader'
            },
            {
              loader: 'stylus-loader',
              options: {
                sourceMap: true,
                import: [path.resolve(__dirname, '../src/commonStyles/commonStyles.styl')]
              }
            }
          ]
        })
      },
      {
        test: /\.woff$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[path][name].[ext]',
          mimetype: 'application/font-woff'
        }
      },
      {
        test: /\.woff2$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[path][name].[ext]',
          mimetype: 'application/font-woff'
        }
      },
      {
        test: /\.ttf$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[path][name].[ext]',
          mimetype: 'application/octet-stream'
        }
      },
      {
        test: /\.eot$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      },
      {
        test: /\.svg$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[path][name].[ext]',
          mimetype: 'image/svg+xml'
        }
      },
      {
        test: /\.(jpe?g|gif|png|)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      },
    ]
  },
  resolve: {
    modules: [
      'src',
      'node_modules'
    ],
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: '../build/index-for-minifying.html',
      template: './webpack/index.tpl.ejs',
    }),
    new CleanPlugin(outPath, {
      root: rootPath
    }),
    new CopyWebpackPlugin([
      { from: "images", to: "images" }
    ]),
    new ExtractTextPlugin({
      filename: '[name].[hash].css'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      },
      'IS_PRODUCTION': true
    }),
    // Optimizations
    new webpack.optimize.UglifyJsPlugin({ // Optimize the JavaScript...
      sourceMap: true,
      compress: {
        warnings: false, // ...but do not show warnings in the console (there is a lot of them)
        drop_console: true // discard calls to console.* functions in bundle file
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      async: true,
      children: true
    }),
    // new BundleAnalyzerPlugin()
  ],
  target: 'web', // Make web variables accessible to webpack, e.g. window
  stats: {
    colors: true,
    hash: false,
    version: false,
    chunks: false,
    children: false
  }
}
