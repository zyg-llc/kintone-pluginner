import path from 'path';
import { pluginUploader } from './uploader'
import { vitePreBuild, vitePostBuild } from './builder'
import { exec } from 'child_process'
import { watch } from 'fs';
import sass from 'sass';

const __dirname = process.cwd()

const preBuildPlugin = () => ({
  name: 'pre-build-plugin',
  buildStart: () => vitePreBuild(),
})

const postBuildPlugin = () => ({
  name: 'post-build-plugin',
  closeBundle: () => vitePostBuild(),
})

const viteBuildProcess = (dev) => {
  return new Promise((resolve, reject) => {
    exec(`vite build${dev ? ' --mode development' : ''}`, {
      env: {
        ...process.env,
        VITE_DISABLE_TIMESTAMP: 'true'
      }
    }, (err, stdout, stderr) => {
      if (err) {
        console.log('🚫 Error', err)
        isBuilding = false;
        reject(stderr)
      }

      if (stderr) {
        console.log('🚫 Error', stderr)
        reject(stderr)
      }

      console.log('🏢 Builded!')
      resolve(stdout)
    })
  })
}

const postServePlugin = () => ({
  name: 'post-serve-plugin',
  configureServer: (server) => {
    viteBuildProcess(true).then(async _ => {
      const watchPath = path.resolve(__dirname, 'src');
      await pluginUploader()

      let isBuilding = false;
      watch(watchPath, { recursive: true }, () => {
        if (isBuilding) return;
        isBuilding = true;

        viteBuildProcess(true).then(_ => {
          pluginUploader().then(_ => {
            isBuilding = false;
          })
        })
      })

      server.middlewares.use((req, res, next) => {
        // console.log(`Request received: ${req.url}`);
        next();
      });
    }).catch(e => {
      console.error(e)
    })
  }
})

// List of files to ensure they exist
export const viteConfig = (ctx) => ({
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
  plugins: [
    preBuildPlugin(),
    postBuildPlugin(),
    postServePlugin(),
  ],
  build: {
    minify: ctx.mode === 'development' ? false : 'esbuild',
    rollupOptions: {
      input: {
        config: path.resolve(__dirname, 'src/config.js'),
        desktop: path.resolve(__dirname, 'src/desktop.js'),
        mobile: path.resolve(__dirname, 'src/mobile.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const { facadeModuleId } = chunkInfo;
          if (facadeModuleId && facadeModuleId.endsWith('.js')) {
            return 'js/[name].js';
          }
          if (facadeModuleId && (facadeModuleId.endsWith('.scss') || facadeModuleId.endsWith('.css'))) {
            return 'css/[name].css';
          }
          return '[name].js';
        },
        assetFileNames: (assetInfo) => {
          const { name } = assetInfo;
          if (name && (name.endsWith('.css') || name.endsWith('.scss'))) {
            return 'css/[name].css';
          }
          return '[name].[ext]';
        },
        chunkFileNames: () => {
          return 'js/[name].js';
        },
      },
    },
  },
});
