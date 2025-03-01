// vite.config.ts
import copy from "rollup-plugin-copy";
import scss from "rollup-plugin-scss";
import path from "path";
import envCompatible from "vite-plugin-env-compatible";
import * as fsPromises from "fs/promises";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";
import { defineConfig } from "vite";

// package.json
var package_default = {
  name: "simple-weather",
  title: "Foundry VTT Simple Weather",
  version: "1.19.2",
  description: "Add dynamic weather to your FoundryVTT world (on top of Simple Calendar).  Note: not affiliated with creators of Simple Calendar.",
  repository: {
    type: "git",
    url: "git+https://github.com/dovrosenberg/foundry-simple-weather.git"
  },
  author: "Dov Rosenberg",
  homepage: "https://github.com/dovrosenberg/foundry-simple-weather#readme",
  main: "main.ts",
  type: "module",
  scripts: {
    build: "vite build",
    debug: "vite build --minify=false --mode development",
    copy: "rm -rf ~/foundryData/Data/modules/simple-weather/* && cp -r $(pwd)/dist/* ~/foundryData/Data/modules/simple-weather",
    linkdata: "ln -s $PWD/dist ~/foundry13data/Data/modules/simple-weather",
    tsc: "tsc --noEmit --skipLibCheck",
    unlinkdata: "unlink ~/foundry13data/Data/modules/simple-weather",
    buildcopy: "npm run build && npm run copy",
    foundry: "node ~/foundry13/resources/app/main.js --dataPath=/home/dov/foundry13data",
    foundry12: "node ~/foundry12/resources/app/main.js --dataPath=/home/dov/foundry12data"
  },
  devDependencies: {
    "@ethaks/fvtt-quench": "^0.9.2",
    "@league-of-foundry-developers/foundry-vtt-types": "github:League-of-Foundry-Developers/foundry-vtt-types",
    "@originjs/vite-plugin-commonjs": "^1.0.1",
    "@types/marked": "^3.0.1",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "css-loader": "^6.4.0",
    eslint: "^8.0.1",
    "eslint-config-prettier": "^8.3.0",
    "foundryvtt-simple-calendar": "^2.4.18",
    marked: "^3.0.7",
    "mini-css-extract-plugin": "^2.4.2",
    "node-sass": "^9.0.0",
    "null-loader": "^4.0.1",
    prettier: "^2.4.1",
    "raw-loader": "^4.0.2",
    "rollup-plugin-copy": "^3.5.0",
    "rollup-plugin-scss": "^4.0.0",
    sass: "^1.45.0",
    "sass-loader": "^13.3.2",
    "semver-increment": "^1.0.1",
    "source-map-loader": "^3.0.0",
    "string-replace-loader": "^3.0.3",
    "style-loader": "^3.3.0",
    "ts-loader": "^9.2.6",
    vite: "^2.7.2",
    "vite-plugin-env-compatible": "^1.1.1",
    "vite-plugin-html": "3.2.0"
  }
};

// vite.config.ts
var vite_config_default = defineConfig({
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve("/home/dov/foundry-simple-weather", "src")
      },
      {
        find: "@module",
        replacement: path.resolve("/home/dov/foundry-simple-weather", "static/module.json")
      },
      {
        find: "@test",
        replacement: path.resolve("/home/dov/foundry-simple-weather", "test")
      }
    ],
    extensions: [
      ".mjs",
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".json",
      ".vue"
    ]
  },
  plugins: [
    copy({
      targets: [
        { src: "static/sounds", dest: "dist" },
        { src: "static/lang", dest: "dist" },
        { src: "static/templates", dest: "dist" }
      ],
      hook: "writeBundle"
    }),
    scss({
      output: "styles/style.css",
      sourceMap: true,
      watch: ["src/styles/*.scss"]
    }),
    viteCommonjs(),
    envCompatible(),
    createHtmlPlugin({
      inject: {
        data: {
          title: "simple-weather"
        }
      }
    }),
    updateModuleManifestPlugin()
  ],
  build: {
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      input: "src/main.ts",
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "output.css")
            return "styles/simple-weather.css";
          else if (assetInfo.name === "output.css.map")
            return "styles/simple-weather.css.map";
          else if (assetInfo.name)
            return assetInfo.name;
          else
            throw "Asset missing name";
        },
        entryFileNames: (assetInfo) => "scripts/index.js",
        format: "es"
      }
    }
  }
});
function updateModuleManifestPlugin() {
  return {
    name: "update-module-manifest",
    async writeBundle() {
      const githubProject = process.env.GH_PROJECT;
      const githubTag = process.env.GH_TAG;
      const moduleVersion = package_default.version;
      const manifestContents = await fsPromises.readFile(
        "static/module.json",
        "utf-8"
      );
      const manifestJson = JSON.parse(manifestContents);
      await fsPromises.writeFile(
        "dist/module.json",
        JSON.stringify(manifestJson, null, 4)
      );
    }
  };
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCBjb3B5IGZyb20gJ3JvbGx1cC1wbHVnaW4tY29weSc7XG5pbXBvcnQgc2NzcyBmcm9tICdyb2xsdXAtcGx1Z2luLXNjc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZW52Q29tcGF0aWJsZSBmcm9tICd2aXRlLXBsdWdpbi1lbnYtY29tcGF0aWJsZSc7XG5pbXBvcnQgKiBhcyBmc1Byb21pc2VzIGZyb20gJ2ZzL3Byb21pc2VzJztcbmltcG9ydCB7IGNyZWF0ZUh0bWxQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1odG1sJztcbmltcG9ydCB7IHZpdGVDb21tb25qcyB9IGZyb20gJ0BvcmlnaW5qcy92aXRlLXBsdWdpbi1jb21tb25qcyc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuXG4vLyB0byBnZXQgdGhlIHZlcnNpb24gbnVtYmVyXG5pbXBvcnQgbnBtUGFja2FnZSBmcm9tICcuL3BhY2thZ2UuanNvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczogW1xuICAgICAge1xuICAgICAgICBmaW5kOiAnQCcsXG4gICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoXCIvaG9tZS9kb3YvZm91bmRyeS1zaW1wbGUtd2VhdGhlclwiLCdzcmMnKVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmluZDogJ0Btb2R1bGUnLFxuICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKFwiL2hvbWUvZG92L2ZvdW5kcnktc2ltcGxlLXdlYXRoZXJcIiwnc3RhdGljL21vZHVsZS5qc29uJylcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbmQ6ICdAdGVzdCcsXG4gICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoXCIvaG9tZS9kb3YvZm91bmRyeS1zaW1wbGUtd2VhdGhlclwiLCd0ZXN0JylcbiAgICAgIH0sXG4gICAgXSxcbiAgICBleHRlbnNpb25zOiBbXG4gICAgICAnLm1qcycsXG4gICAgICAnLmpzJyxcbiAgICAgICcudHMnLFxuICAgICAgJy5qc3gnLFxuICAgICAgJy50c3gnLFxuICAgICAgJy5qc29uJyxcbiAgICAgICcudnVlJ1xuICAgIF1cbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIC8vIGNvcHkgdGhlIHN0YXRpYyBtb2R1bGUgZmlsZVxuICAgIGNvcHkoe1xuICAgICAgdGFyZ2V0czogW1xuICAgICAgICB7IHNyYzogJ3N0YXRpYy9zb3VuZHMnLCBkZXN0OiAnZGlzdCcgfSxcbiAgICAgICAgeyBzcmM6ICdzdGF0aWMvbGFuZycsIGRlc3Q6ICdkaXN0JyB9LFxuICAgICAgICB7IHNyYzogJ3N0YXRpYy90ZW1wbGF0ZXMnLCBkZXN0OiAnZGlzdCcgfVxuICAgICAgXSxcbiAgICAgIGhvb2s6ICd3cml0ZUJ1bmRsZScsXG4gICAgfSksXG4gICAgc2Nzcyh7XG4gICAgICBvdXRwdXQ6ICdzdHlsZXMvc3R5bGUuY3NzJyxcbiAgICAgIHNvdXJjZU1hcDogdHJ1ZSxcbiAgICAgIHdhdGNoOiBbJ3NyYy9zdHlsZXMvKi5zY3NzJ10sXG4gICAgfSksICAgIHZpdGVDb21tb25qcygpLFxuICAgIGVudkNvbXBhdGlibGUoKSxcbiAgICBjcmVhdGVIdG1sUGx1Z2luKHtcbiAgICAgIGluamVjdDoge1xuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgdGl0bGU6ICdzaW1wbGUtd2VhdGhlcidcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLFxuICAgIHVwZGF0ZU1vZHVsZU1hbmlmZXN0UGx1Z2luKCksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiAnc3JjL21haW4udHMnLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKTogc3RyaW5nID0+IHtcbiAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWUgPT09ICdvdXRwdXQuY3NzJykgXG4gICAgICAgICAgICByZXR1cm4gJ3N0eWxlcy9zaW1wbGUtd2VhdGhlci5jc3MnO1xuICAgICAgICAgIGVsc2UgaWYgKGFzc2V0SW5mby5uYW1lID09PSdvdXRwdXQuY3NzLm1hcCcpXG4gICAgICAgICAgICByZXR1cm4gJ3N0eWxlcy9zaW1wbGUtd2VhdGhlci5jc3MubWFwJztcbiAgICAgICAgICBlbHNlIGlmIChhc3NldEluZm8ubmFtZSlcbiAgICAgICAgICAgIHJldHVybiBhc3NldEluZm8ubmFtZTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyAnQXNzZXQgbWlzc2luZyBuYW1lJztcbiAgICAgICAgfSwgICAgICAgIFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogKGFzc2V0SW5mbyk6IHN0cmluZyA9PiAnc2NyaXB0cy9pbmRleC5qcycsXG4gICAgICAgIGZvcm1hdDogJ2VzJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfVxufSk7XG5cbi8vIGEgcGx1Z2luIHRvIHNhdmUgdGhlIG1hbmlmZXN0LCBzZXR0aW5nIHRoZSB2ZXJzaW9uICMgZnJvbSB0aGUgbnBtIHBhY2thZ2UuanNvblxuLy8gdGhvdWdoIHdlIGFyZSBub3cgc2V0dGluZyB2ZXJzaW9uIGluIGdpdGh1YiBhY3Rpb24sIHNvIHdlIHNraXAgYWxsIHRoYXRcbmZ1bmN0aW9uIHVwZGF0ZU1vZHVsZU1hbmlmZXN0UGx1Z2luKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3VwZGF0ZS1tb2R1bGUtbWFuaWZlc3QnLFxuICAgIGFzeW5jIHdyaXRlQnVuZGxlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgLy8gZ2V0IGdpdGh1YiBpbmZvXG4gICAgICBjb25zdCBnaXRodWJQcm9qZWN0ID0gcHJvY2Vzcy5lbnYuR0hfUFJPSkVDVDtcbiAgICAgIGNvbnN0IGdpdGh1YlRhZyA9IHByb2Nlc3MuZW52LkdIX1RBRztcblxuICAgICAgLy8gZ2V0IHRoZSB2ZXJzaW9uIG51bWJlclxuICAgICAgY29uc3QgbW9kdWxlVmVyc2lvbiA9IG5wbVBhY2thZ2UudmVyc2lvbjtcblxuICAgICAgLy8gcmVhZCB0aGUgc3RhdGljIGZpbGVcbiAgICAgIGNvbnN0IG1hbmlmZXN0Q29udGVudHM6IHN0cmluZyA9IGF3YWl0IGZzUHJvbWlzZXMucmVhZEZpbGUoXG4gICAgICAgICdzdGF0aWMvbW9kdWxlLmpzb24nLFxuICAgICAgICAndXRmLTgnXG4gICAgICApO1xuXG4gICAgICAvLyBjb252ZXJ0IHRvIEpTT05cbiAgICAgIGNvbnN0IG1hbmlmZXN0SnNvbiA9IEpTT04ucGFyc2UobWFuaWZlc3RDb250ZW50cykgYXMgUmVjb3JkPHN0cmluZyx1bmtub3duPjtcblxuICAgICAgLy8gLy8gc2V0IHRoZSB2ZXJzaW9uICNcbiAgICAgIC8vIGlmIChtb2R1bGVWZXJzaW9uKSB7XG4gICAgICAvLyAgIGRlbGV0ZSBtYW5pZmVzdEpzb25bJyMjIGNvbW1lbnQ6dmVyc2lvbiddO1xuICAgICAgLy8gICBtYW5pZmVzdEpzb24udmVyc2lvbiA9IG1vZHVsZVZlcnNpb247XG4gICAgICAvLyB9XG5cbiAgICAgIC8vIC8vIHNldCB0aGUgcmVsZWFzZSBpbmZvXG4gICAgICAvLyBpZiAoZ2l0aHViUHJvamVjdCkge1xuICAgICAgLy8gICBjb25zdCBiYXNlVXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke2dpdGh1YlByb2plY3R9L3JlbGVhc2VzYDtcbiAgICAgIC8vICAgbWFuaWZlc3RKc29uLm1hbmlmZXN0ID0gYCR7YmFzZVVybH0vbGF0ZXN0L2Rvd25sb2FkL21vZHVsZS5qc29uYDtcblxuICAgICAgLy8gICBpZiAoZ2l0aHViVGFnKSB7XG4gICAgICAvLyAgICAgbWFuaWZlc3RKc29uLmRvd25sb2FkID0gYCR7YmFzZVVybH0vZG93bmxvYWQvJHtnaXRodWJUYWd9L21vZHVsZS56aXBgO1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9XG5cbiAgICAgIC8vIHdyaXRlIHRoZSB1cGRhdGVkIGZpbGVcbiAgICAgIGF3YWl0IGZzUHJvbWlzZXMud3JpdGVGaWxlKFxuICAgICAgICAnZGlzdC9tb2R1bGUuanNvbicsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KG1hbmlmZXN0SnNvbiwgbnVsbCwgNClcbiAgICAgICk7XG4gICAgfSxcbiAgfTtcbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sVUFBVTtBQUNqQixPQUFPLFVBQVU7QUFDakIsT0FBTyxtQkFBbUI7QUFDMUIsWUFBWSxnQkFBZ0I7QUFDNUIsU0FBUyx3QkFBd0I7QUFDakMsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxvQkFBNEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtyQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTDtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sYUFBYSxLQUFLLFFBQVEsb0NBQW1DLEtBQUs7QUFBQSxNQUNwRTtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLGFBQWEsS0FBSyxRQUFRLG9DQUFtQyxvQkFBb0I7QUFBQSxNQUNuRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLGFBQWEsS0FBSyxRQUFRLG9DQUFtQyxNQUFNO0FBQUEsTUFDckU7QUFBQSxJQUNGO0FBQUEsSUFDQSxZQUFZO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFFUCxLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDUCxFQUFFLEtBQUssaUJBQWlCLE1BQU0sT0FBTztBQUFBLFFBQ3JDLEVBQUUsS0FBSyxlQUFlLE1BQU0sT0FBTztBQUFBLFFBQ25DLEVBQUUsS0FBSyxvQkFBb0IsTUFBTSxPQUFPO0FBQUEsTUFDMUM7QUFBQSxNQUNBLE1BQU07QUFBQSxJQUNSLENBQUM7QUFBQSxJQUNELEtBQUs7QUFBQSxNQUNILFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxNQUNYLE9BQU8sQ0FBQyxtQkFBbUI7QUFBQSxJQUM3QixDQUFDO0FBQUEsSUFBTSxhQUFhO0FBQUEsSUFDcEIsY0FBYztBQUFBLElBQ2QsaUJBQWlCO0FBQUEsTUFDZixRQUFRO0FBQUEsUUFDTixNQUFNO0FBQUEsVUFDSixPQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELDJCQUEyQjtBQUFBLEVBQzdCO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsTUFDUCxRQUFRO0FBQUEsUUFDTixnQkFBZ0IsQ0FBQyxjQUFzQjtBQUNyQyxjQUFJLFVBQVUsU0FBUztBQUNyQixtQkFBTztBQUFBLG1CQUNBLFVBQVUsU0FBUTtBQUN6QixtQkFBTztBQUFBLG1CQUNBLFVBQVU7QUFDakIsbUJBQU8sVUFBVTtBQUFBO0FBRWpCLGtCQUFNO0FBQUEsUUFDVjtBQUFBLFFBQ0EsZ0JBQWdCLENBQUMsY0FBc0I7QUFBQSxRQUN2QyxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQztBQUlELFNBQVMsNkJBQXFDO0FBQzVDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE1BQU0sY0FBNkI7QUFFakMsWUFBTSxnQkFBZ0IsUUFBUSxJQUFJO0FBQ2xDLFlBQU0sWUFBWSxRQUFRLElBQUk7QUFHOUIsWUFBTSxnQkFBZ0IsZ0JBQVc7QUFHakMsWUFBTSxtQkFBMkIsTUFBaUI7QUFBQSxRQUNoRDtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBR0EsWUFBTSxlQUFlLEtBQUssTUFBTSxnQkFBZ0I7QUFtQmhELFlBQWlCO0FBQUEsUUFDZjtBQUFBLFFBQ0EsS0FBSyxVQUFVLGNBQWMsTUFBTSxDQUFDO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
