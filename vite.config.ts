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
        { src: 'static/sounds', dest: 'dist' },
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
    updateModuleManifestPlugin(),
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

// a plugin to save the manifest, setting the version # from the npm package.json
// though we are now setting version in github action, so we skip all that
function updateModuleManifestPlugin(): Plugin {
  return {
    name: 'update-module-manifest',
    async writeBundle(): Promise<void> {
      // get github info
      const githubProject = process.env.GH_PROJECT;
      const githubTag = process.env.GH_TAG;

      // get the version number
      const moduleVersion = npmPackage.version;

      // read the static file
      const manifestContents: string = await fsPromises.readFile(
        'static/module.json',
        'utf-8'
      );

      // convert to JSON
      const manifestJson = JSON.parse(manifestContents) as Record<string,unknown>;

      // // set the version #
      // if (moduleVersion) {
      //   delete manifestJson['## comment:version'];
      //   manifestJson.version = moduleVersion;
      // }

      // // set the release info
      // if (githubProject) {
      //   const baseUrl = `https://github.com/${githubProject}/releases`;
      //   manifestJson.manifest = `${baseUrl}/latest/download/module.json`;

      //   if (githubTag) {
      //     manifestJson.download = `${baseUrl}/download/${githubTag}/module.zip`;
      //   }
      // }

      // write the updated file
      await fsPromises.writeFile(
        'dist/module.json',
        JSON.stringify(manifestJson, null, 4)
      );
    },
  };
}