import { readFileSync, writeFileSync, existsSync, readdirSync, watch } from 'fs';
import { exec } from 'child_process'
import path from 'path';
import fsExtra from 'fs-extra'
import createPPK from '../create-ppk'
import Spinner from '../console-spinner';

const __dirname = process.cwd()

export const vitePreBuild = (callback) => {
  console.log('🔨 Building...')

  if (existsSync(path.resolve(__dirname, 'dist'))) {
    const distPath = path.resolve(__dirname, 'dist')
    fsExtra.removeSync(distPath)
  }

  // PPK作成
  if (!existsSync(path.resolve(__dirname, 'private.ppk'))) {
    createPPK()
  }

  if (callback) callback()
}

export const vitePostBuild = (callback) => {
  fsExtra.copySync(path.resolve(__dirname, 'src/icon.png'), path.resolve(__dirname, 'dist/icon.png'))
  fsExtra.copySync(path.resolve(__dirname, 'src/config.html'), path.resolve(__dirname, 'dist/config.html'))

  const distPath = path.resolve(__dirname, 'dist');
  const manifestPath = path.resolve(__dirname, 'manifest.json');
  if (existsSync(distPath)) {
    const manifestData = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    try {
      const getAllFiles = (dirPath, arrayOfFiles) => {
        const files = readdirSync(dirPath, { withFileTypes: true });
        arrayOfFiles = arrayOfFiles || [];

        files.forEach((file) => {
          if (file.isDirectory()) {
            arrayOfFiles = getAllFiles(path.resolve(dirPath, file.name), arrayOfFiles);
          } else {
            const relativePath = path.relative(distPath, path.resolve(dirPath, file.name)).replace(/\\/g, '/');
            arrayOfFiles.push(relativePath);
          }
        });

        return arrayOfFiles;
      };

      const allFiles = getAllFiles(distPath)
      allFiles.forEach((filePath) => {
        const [path, fileName] = (filePath.includes('/') ? filePath : '/'+filePath).split('/')
        const [name, ext] = fileName.split('.')

        if (!path) {
          if (['png','gif','jpg'].includes(ext)) {
            manifestData.icon = fileName
          } else {
            manifestData.config[ext] = fileName
          }
        } else {
          manifestData[name][ext] = [ext +'/'+ fileName]
        }
      })

      writeFileSync(path.resolve(__dirname, 'dist/manifest.json'), JSON.stringify(manifestData, null, 2));

      if (existsSync(distPath)) {
        return new Promise((resolve, reject) => {
          exec(`kintone-plugin-packer --ppk private.ppk --out plugin.zip dist`, { encoding: 'UTF-8' }, (err, stdout, stderr) => {
            if (err || stderr) reject(err || stderr)
            console.log('🏢 Builded!')
            if (callback) callback()
            resolve(stdout)
          })
        })
      }
    } catch (error) {
      console.error('🚫 Error', error);
    }
  } else {
    console.warn('manifest.json not found, skipping modification.');
  }
}
