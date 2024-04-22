const { exec } = require('child_process')
const path  = require('path')

const pluginUploader = (env) => {
  let command = `npx @kintone/plugin-uploader`
  const options = [
    ['--base-url', env.KINTONE_BASE_URL],
    ['--username', env.KINTONE_USERNAME],
    ['--password', env.KINTONE_PASSWORD],
    [path.resolve(`./plugin.zip`)],
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

module.exports = pluginUploader