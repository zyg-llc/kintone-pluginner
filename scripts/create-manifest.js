const fs    = require('fs')
const path  = require('path')

const createManifest = () => {
  const manifestFile = path.resolve(__dirname, '../manifest.json')
  const json = JSON.parse(
    fs.readFileSync(manifestFile, {
      encoding: 'utf-8'
    })
  )

  //ファイルとディレクトリのリストが格納される(配列)
  const dist = path.resolve(__dirname, '../dist')
  const files = fs.readdirSync(dist)

  //ディレクトリのリストに絞る
  const dirList = files.filter((file) => {
    return fs.statSync(path.join(dist, file)).isDirectory()
  })

  const types = ['desktop', 'mobile', 'config']
  for (const type of types) {
    dirList.forEach(ext => {
      const file = `${ext}/${type}.${ext}`
      if (fs.existsSync(path.resolve(__dirname, `../dist/${file}`))) {
        json[type][ext].push(file)
      }
    })
  }

  fs.writeFileSync(path.resolve(__dirname, '../dist/manifest.json'), JSON.stringify(json, null, '\t'));
}

module.exports = createManifest