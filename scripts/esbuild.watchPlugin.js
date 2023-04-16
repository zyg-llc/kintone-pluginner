const fs    = require('fs')
const fsx   = require('fs-extra')
const path  = require('path')
const dotenv  = require('dotenv').config({path: path.resolve(__dirname, '../env/.env')})
const { exec } = require('child_process')
const createManifest = require('./create-manifest')

const watchPlugin = {
  name: 'watch-plugin',
  setup(build) {
    build.onEnd(async (result) => {

      if (result.errors.length > 0) {
        console.log('🚫 Error!', result.errors)
      } else {
        fsx.copySync(path.resolve(__dirname, `../src/icon.png`),    path.resolve(__dirname, `../dist/icon.png`))
        fsx.copySync(path.resolve(__dirname, `../src/config.html`), path.resolve(__dirname, `../dist/config.html`))

        const cssDir = path.resolve(__dirname, `../dist/css`)
        if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir)

        createManifest()
        console.log('🏠 Builded!')

        console.log('🔄 Uploading...')
        await pluginPacker()
        await pluginUploader()
      }
    })
  }
}

module.exports = watchPlugin


const pluginPacker = () => {
  const command = `yarn kintone-plugin-packer --ppk private.ppk --out plugin.zip dist`
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
  const env = dotenv.parsed;
  let command = `yarn kintone-plugin-uploader`
  const options = [
    ['--base-url', env.KINTONE_BASE_URL],
    ['--username', env.KINTONE_USERNAME],
    ['--password', env.KINTONE_PASSWORD],
    ['plugin.zip'],
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