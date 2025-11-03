const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = (config, context) => {
  return {
    ...config,
    output: {
      path: join(__dirname, '../../dist/apps/backend'),
    },
    watch: context.options.watch || false,
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
    },
    plugins: [
      new NxAppWebpackPlugin({
        target: 'node',
        compiler: 'tsc',
        main: './src/main.ts',
        tsConfig: './tsconfig.app.json',
        assets: ['./src/assets'],
        optimization: false,
        outputHashing: 'none',
        generatePackageJson: false,
      }),
    ],
  };
};
