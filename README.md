# kintoneカスタマイズ

## 導入方法

```bash
# リポジトリをクローン
git clone https://github.com/zero-product/kintone-pluginner.git

# プロジェクトディレクトリに移動
cd kintone-pluginner

# モジュール、ライブラリ インストール
yarn install
```

### 1. 環境変数ファイル(.env)

`./env/.env.example`を同ディレクトリに`./env/.env`として複製。

```bash
KINTONE_BASE_URL=https://~.cybozu.com   # kintone環境URL(最後のスラッシュ`/`は不要)
KINTONE_USERNAME= # デプロイ権限のあるユーザーのユーザー名(例: Administrator)
KINTONE_PASSWORD= # デプロイ権限のあるユーザーのパスワード
```

### 2. 秘密鍵発行

```bash
yarn create-ppk
```

### 3. manifest.json

`./manifest.json`を、「[マニフェストファイルのフォーマット](https://cybozudev.zendesk.com/hc/ja/articles/203455680-kintone-%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E9%96%8B%E7%99%BA%E6%89%8B%E9%A0%86#create-manifest_format)」を参考に書き換えてください。

## コマンド一覧

|コマンド|概要|
|-|-|
|`yarn create-ppk`|秘密鍵発行|
|`yarn dev`|ソースコードを更新するとkintoneに反映される。|
|`yarn deploy`|カスタマイズをkintoneに"本番モード"で反映します。|

## Vue.js(Option)

1. Vue3, esbuild用Vue3ローダー インストール

    ```bash
    yarn add -D vue esbuild-plugin-vue3
    ```

1. esbuild (`./scripts/esbuild.config.js`) 設定変更

    ```javascript

    // ... 略 ...

    const esbuildEnv  = require('esbuild-envfile-plugin')
    const vuePlugin = require("esbuild-plugin-vue3")    // ← 追加

    // ... 略 ...

    const builder = {
      // ... 略 ...
      plugins: [
        esbuildEnv,
        vuePlugin(),  // ← 追加
        sassPlugin(),
      ],
      // ... 略 ...
    }

    // ... 略 ...
    ```

1. `./src/config`ディレクトリに`App.vue`を作成

    ```html
    <script setup>
    </script>

    <template>
      <div>Hello World!</div>
    </template>
    ```

1. `config.js`でVue3を読込み

    ```javascript

    import { createApp } from 'vue'
    import App from './config/App.vue'

    // ... 略 ...

    kintone.events.on('app.record.index.show', (event) => {
      console.log(event);

      /** **************************************************************
       * 例1) カスタマイズビュー
       *
       * kintoneのカスタマイズビューの`HTML`欄に
       * `<div id="app"></div>`
       * を登録してください。
       ************************************************************** */
      const app = createApp(App)
      app.mount('#app')

      /** **************************************************************
       * 例2) 一覧のメニューの右側の空白部分
       ************************************************************** */
      if (!document.getElementById('app')) {
        // ヘッダー要素取得
        const header = kintone.app.getHeaderMenuSpaceElement()

        // `div#app` 要素を作成
        const appEl = document.createElement('div')
        appEl.id = 'app'

        // ヘッダー要素に `div#app` 要素を追加
        header.appendChild(appEl)

        // Vue定義
        createApp(App).mount('#app')
      }
    });
    ```
