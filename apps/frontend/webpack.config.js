const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { join } = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

const ENV = process.env.NODE_ENV || 'development';
const envFile =
  ENV === 'production' ? './envs/.prod.env'
    : ENV === 'test'     ? './envs/.test.env'
      :                      './envs/.dev.env';

dotenv.config({ path: envFile });

module.exports = {
  output: { path: join(__dirname, 'dist') },
  devServer: {
    port: 4200,
    hot: true,
    liveReload: true,
    watchFiles: ['src/**/*'],
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref: '/',
      assets: ['./src/favicon.ico', './src/assets'],
      styles: ['./src/styles.scss'],
      outputHashing: process.env.NODE_ENV === 'production' ? 'all' : 'none',
      optimization: process.env.NODE_ENV === 'production',
    }),
    new NxReactWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL || ''),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(mp3|wav|ogg)$/i,
        type: 'asset/resource',
        generator: { filename: 'assets/[name][ext]' },
      },
    ],
  },
};