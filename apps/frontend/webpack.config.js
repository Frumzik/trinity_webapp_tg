const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { join } = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const mode =
  process.env.NX_TASK_TARGET_CONFIGURATION ||
  process.env.NODE_ENV ||
  'development';

// выбираем нужный envs-файл
const envFile =
  mode === 'production' ? '.prod.env' :
    mode === 'test'       ? '.test.env' :
      '.dev.env';

const myEnv = dotenv.config({ path: join(__dirname, 'envs', envFile) });
dotenvExpand.expand(myEnv);

console.log('[webpack] MODE =', mode, 'ENV FILE =', envFile, 'NX_API_URL =', process.env.NX_API_URL);

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
      outputHashing: mode === 'production' ? 'all' : 'none',
      optimization: mode === 'production',
    }),
    new NxReactWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NX_API_URL': JSON.stringify(process.env.NX_API_URL || ''),
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