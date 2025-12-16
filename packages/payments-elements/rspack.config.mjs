import rspack from '@rspack/core';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

/**
 * @type {import('@rspack/core').Configuration}
 */
export default {
  mode: isProduction ? 'production' : 'development',

  entry: './src/index.ts',

  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      type: 'module',
    },
    module: true,
    chunkFormat: 'module',
    clean: true,
  },

  experiments: {
    outputModule: true,
  },

  externals: {
    lit: 'lit',
    'lit-element': 'lit-element',
    'lit-html': 'lit-html',
    '@lit/reactive-element': '@lit/reactive-element',
  },

  resolve: {
    extensions: ['.js', '.ts', '.json'],
  },

  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  decorators: true,
                },
                transform: {
                  legacyDecorator: true,
                  decoratorMetadata: false,
                  useDefineForClassFields: false,
                },
                target: 'es2020',
                minify: isProduction
                  ? {
                      compress: {
                        passes: 2,
                        drop_console: false,
                      },
                      mangle: {
                        keepClassNames: true,
                        keepFnNames: true,
                      },
                    }
                  : undefined,
              },
            },
          },
          {
            loader: 'minify-html-literals-loader',
            options: {
              minifyOptions: {
                removeComments: true,
                collapseWhitespace: true,
                minifyCSS: true,
                removeAttributeQuotes: false,
              },
            },
          },
        ],
      },
    ],
  },

  optimization: {
    minimize: isProduction,
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          compress: {
            passes: 2,
            drop_console: false,
            ecma: 2020,
            module: true,
          },
          mangle: {
            keep_classnames: true,
            keep_fnames: true,
          },
          format: {
            comments: false,
            ecma: 2020,
          },
        },
      }),
    ],
  },
  sideEffects: true,

  plugins: [
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'production',
      ),
    }),
  ],

  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
};
