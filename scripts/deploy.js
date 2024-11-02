import { pluginUploader } from './vite/uploader.js'

pluginUploader().then(resp => {
  console.log(resp)
}).catch(e => {
  // console.error(e.status, e.data)
})