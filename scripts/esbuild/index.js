const fs    = require('fs')
const fsx   = require('fs-extra')
const path  = require('path')
const lodash = require('lodash');
const { exec }    = require('child_process')
const { program } = require('commander')
const { build, context } = require('esbuild')
const { sassPlugin }  = require('esbuild-sass-plugin')
const esbuildEnv      = require('esbuild-envfile-plugin')
const watchPlugin     = require('./esbuild-watch-plugin')
const config          = require(path.resolve('esbuild.config.js'))
// const deploy      = require('./uploader')

program.option('--node-env', 'NODE_ENV', '"development"')
program.option('-e, --env', '.envファイル', '.env')
program.option('-W, --watch', 'ウォッチャー起動(Devモード)', false)
program.option('-D, --deploy', 'デプロイ', false);
program.parse();
const opt = program.opts();

const appenv  = require('dotenv').config({path: path.resolve(opt.env)})
const builder = lodash.merge({}, {
  entryPoints: [
    path.resolve('./src/config.js'),
    path.resolve('./src/desktop.js'),
    path.resolve('./src/mobile.js'),
  ],
  entryNames: '[ext]/[name]',

  plugins: [
    esbuildEnv,
    watchPlugin,
    sassPlugin(),
  ],
  define: {
    'process.env': JSON.stringify(appenv.parsed ?? {}),
    'process.env.NODE_ENV': opt.watch ? '"development"' : '"production"',
  },
  outdir: path.resolve('dist'),
  minify: !opt.watch,
  bundle: true,
}, config)

removeDist().then(async _ => {
  if (!fs.existsSync(path.resolve('./private.ppk'))) {
    console.log('🔑 PPK Created!')
    await createPpk()
  }

  console.log('🔨 Building...')
  if (opt.watch) {
    // パッケージビルド
    const ctx = await context(builder)

    // watchモード準備
    await pluginUploader()

    await ctx.watch()
  } else {
    await build(builder)

    if (opt.deploy) await pluginUploader()
  }
}).catch(e => {
  console.log('🚫 Error!')
  console.log(e)
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


const pluginUploader = () => {
  let command = `npx @kintone/plugin-uploader`
  const options = [
    ['--base-url', appenv.KINTONE_BASE_URL],
    ['--username', appenv.KINTONE_USERNAME],
    ['--password', appenv.KINTONE_PASSWORD],
    [path.resolve(`plugin.zip`)],
  ]
  options.forEach(opt => command += ` ` + opt.join(' '))

  return new Promise((resolve, reject) => {
    console.log('🔄 Uploading...')
    exec(command, { encoding: 'UTF-8' }, (err, stdout, stderr) => {
      if (err) {
        reject(stderr)
      } else {
        console.log('✅ Uploaded!')
        resolve(stdout)
      }
    })
  })
}