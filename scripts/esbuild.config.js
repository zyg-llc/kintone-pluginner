const fs    = require('fs')
const fsx   = require('fs-extra')
const path  = require('path')
const { exec } = require('child_process')
const { build, context } = require('esbuild')
const { sassPlugin }  = require('esbuild-sass-plugin')
const esbuildEnv      = require('esbuild-envfile-plugin')
const watchPlugin     = require('./esbuild.watchPlugin')
const appenv = require('dotenv').config({path: path.resolve(__dirname, '../.env')})
const dotenv = require('dotenv').config({path: path.resolve(__dirname, '../env/.env')})
// const deploy      = require('./uploader')

const args    = process.argv.slice(2)
const watch   = args.includes('--watch')  || args.includes('-W');
const deploy  = args.includes('--deploy') || args.includes('-D');
const env     = dotenv.parsed;
const outdir  = path.resolve(__dirname, '../dist')

const builder = {
  entryPoints: [
    path.resolve(__dirname, '../src/config.js'),
    path.resolve(__dirname, '../src/desktop.js'),
    path.resolve(__dirname, '../src/mobile.js'),
  ],
  entryNames: '[ext]/[name]',

  plugins: [
    esbuildEnv,
    watchPlugin,
    sassPlugin(),
  ],
  define: {
    'process.env': JSON.stringify(appenv.parsed),
    'process.env.NODE_ENV': process.env.NODE_ENV || 'development',
  },
  outdir: outdir,
  minify: !watch,
  bundle: true,
}


removeDist().then(async _ => {
  if (!fs.existsSync(path.resolve(__dirname, '../private.ppk'))) {
    console.log('🔑 PPK Created!')
    await createPpk()
  }

  console.log('🔨 Building...')
  if (watch) {
    // パッケージビルド
    const ctx = await context(builder)

    await pluginUploader()

    // watchモード準備
    await ctx.watch()
  } else {
    await build(builder)

    if (deploy) {
      await pluginUploader()
    }
  }
}).catch(e => {
  console.log('🚫 Error!')
  console.log(e)
})

function removeDist() {
  return new Promise((resolve) => {
    if (fs.existsSync(outdir)) {
      fsx.remove(outdir)
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
  console.log('🔄 Uploading...')
  let command = `yarn kintone-plugin-uploader`
  const options = [
    ['--base-url', env.KINTONE_BASE_URL],
    ['--username', env.KINTONE_USERNAME],
    ['--password', env.KINTONE_PASSWORD],
    [path.resolve(__dirname, `../plugin.zip`)],
  ]
  options.forEach(opt => command += ` ` + opt.join(' '))

  return new Promise((resolve, reject) => {
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