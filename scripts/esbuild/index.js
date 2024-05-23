const fs    = require('fs')
const fsx   = require('fs-extra')
const path  = require('path')
const lodash = require('lodash');
const { build, context } = require('esbuild')
const { program }     = require('commander')
const { exec }        = require('child_process')
const { sassPlugin }  = require('esbuild-sass-plugin')
const esbuildEnv      = require('esbuild-envfile-plugin')
const watchPlugin     = require('./esbuild-watch-plugin')
const pluginUploader  = require('./uploader')
const config          = require(path.resolve('esbuild.config.js'))
// const deploy      = require('./uploader')

program.option('--node-env', 'NODE_ENV', '"development"')
program.option('-e, --env', '.envファイル', '.env')
program.option('-W, --watch', 'ウォッチャー起動(Devモード)', false)
program.option('-D, --deploy', 'デプロイ', false);
program.parse();
const opt = program.opts();

const appenv  = require('dotenv').config({path: path.resolve(opt.env)})?.parsed
const builder = lodash.merge({}, {
  entryPoints: [
    path.resolve('./src/config.js'),
    path.resolve('./src/desktop.js'),
    path.resolve('./src/mobile.js'),
  ],
  entryNames: '[ext]/[name]',

  plugins: [
    esbuildEnv,
    watchPlugin(opt),
    // htmlModulesPlugin(),
    sassPlugin(),
  ],
  define: {
    'process.env': JSON.stringify(appenv ?? {}),
    'process.env.NODE_ENV': opt.watch ? '"development"' : '"production"',
  },
  pure: opt.watch ? [] : ['console.log', 'console.info'],
  outdir: path.resolve('dist'),
  minify: !opt.watch,
  bundle: true,
}, config)

removeDist().then(async _ => {
  if (!fs.existsSync(path.resolve('./private.ppk'))) {
    console.log('🔑 PPK Created!')
    await createPpk()
  }

  if (opt.watch) {
    // パッケージビルド
    const ctx = await context(builder)

    // // watchモード準備
    // await pluginUploader(appenv)

    await ctx.watch()
  } else {
    await build(builder)

    if (opt.deploy) await pluginUploader()
  }
}).catch(e => {
  console.log('🚫 Error!')
  console.log(e)
  process.exit(1);
})

function removeDist() {
  return new Promise((resolve) => {
    if (fs.existsSync(builder.outdir)) {
      fsx.remove(builder.outdir)
      resolve(true)
    } else {
      resolve(false)
    }
  })
}


const createPpk = () => {
  const command = `yarn create-ppk`
  return new Promise((resolve, reject) => {
    exec(command, { encoding: 'UTF-8' }, (err, stdout, stderr) => {
      if (err) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}

