import axios from 'axios'
import path  from 'node:path'
import fs    from 'node:fs'

const __dirname = process.cwd()

export const pluginUploader = () => {
  const pluginPath = path.resolve(__dirname, 'plugin.zip')
  const authJson = path.resolve(__dirname, 'auth.json')
  if (!fs.existsSync(pluginPath)) {
    throw new Error('プラグインファイル(zip)がありません。ビルドしてください。')
  }
  if (!fs.existsSync(authJson)) {
    throw new Error('認証情報ファイル(auth.json)がありません。')
  }
  const auth = JSON.parse(fs.readFileSync(authJson, 'utf-8'))

  return new Promise((resolve, reject) => {
    const Authorization = Buffer.from(`${auth?.username}:${auth?.password}`).toString('base64')

    const client = axios.create({
      baseURL: auth?.base_url+'/k/api',
      headers: { 'X-Cybozu-Authorization': Authorization },
    })

    console.log('⌛️ Uploading...')
    client.post('/blob/upload.json', { file: fs.createReadStream(pluginPath) }, {
      headers: { 'Content-Type': 'multipart/form-data', }
    }).then(({data}) => {
      const fileKey = data.result?.fileKey

      client.post('/dev/plugin/import.json', { item: fileKey }).then(({data}) => {
        if (data.success) {
          console.log('✅ Uploaded!')
          resolve(data.result)
        } else {
          reject(data)
        }
      }).catch(e => {
        console.error(e)
        console.log('🚫 Error', e)
        reject(e.response)
      })
    }).catch(e => {
      console.log('🚫 Error', e)
      reject(e.response)
    })
  })
}