import fs from 'fs'
import path from 'path'
import NodeRSA from 'node-rsa'

// プロジェクトのルートディレクトリを取得
const __dirname = process.cwd()

const createPPK = () => {
  const key = new NodeRSA({ b: 1024 });
  const rsa = key.exportKey("pkcs1-private");
  fs.writeFileSync(path.resolve(__dirname, 'private.ppk'), rsa)
}

export default createPPK