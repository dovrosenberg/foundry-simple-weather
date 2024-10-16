import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';
import path from 'path';
import envCompatible from 'vite-plugin-env-compatible';
import * as fsPromises from 'fs/promises';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { defineConfig, Plugin } from 'vite';

// to get the verison number
import npmPackage from './package.json';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname,'src')
      },
      {
        find: '@module',
        replacement: path.resolve(__dirname,'static/module.json')
      },
    ],
    extensions: [
      '.mjs',
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
      '.vue'
    ]
  },
  plugins: [
    // copy the static module file
    copy({
      targets: [
        { src: 'static/lang', dest: 'dist' },
        { src: 'static/templates', dest: 'dist' }
      ],
      hook: 'writeBundle',
    }),
    scss({
      output: 'styles/style.css',
      sourceMap: true,
      watch: ['src/styles/*.scss'],
    }),    viteCommonjs(),
    envCompatible(),
    createHtmlPlugin({
      inject: {
        data: {
          title: 'simple-weather'
        }
      }
    }),
  ],
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        assetFileNames: (assetInfo): string => {
          if (assetInfo.name === 'output.css') 
            return 'styles/simple-weather.css';
          else if (assetInfo.name ==='output.css.map')
            return 'styles/simple-weather.css.map';
          else if (assetInfo.name)
            return assetInfo.name;
          else
            throw 'Asset missing name';
        },        
        entryFileNames: (assetInfo): string => 'scripts/index.js',
        format: 'es',
      },
    },
  }
});
