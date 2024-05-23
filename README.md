# kintoneプラグイン

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

`./.env.example`と同じディレクトリに`./.env`を作成してください。


### 2. 認証情報ファイル(auth.json)

`./auth.json.example`と同じディレクトリに`./auth.json`を作成し、以下のように記述してください。

```json
{
  "base_url": "https://~.cybozu.com"  # kintone環境URL(最後のスラッシュ`/`は不要)
  "username": "", # デプロイ権限のあるユーザーのユーザー名(例: Administrator)
  "password": ""  # デプロイ権限のあるユーザーのパスワード
}
```

### 3. 秘密鍵発行

```bash
yarn create-ppk
```

### 4. manifest.json

`./manifest.json`を、「[マニフェストファイルのフォーマット](https://cybozudev.zendesk.com/hc/ja/articles/203455680-kintone-%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E9%96%8B%E7%99%BA%E6%89%8B%E9%A0%86#create-manifest_format)」を参考に書き換えてください。

## コマンド一覧

|コマンド|概要|
|-|-|
|`yarn create-ppk`|秘密鍵発行|
|`yarn build`|プラグインを生成(`plugin.zip`)|
|`yarn dev`|ソースコードを更新するとkintoneに反映される。|
|`yarn deploy`|カスタマイズをkintoneに"本番モード"で反映します。|

## Vue.js(Option)

1. Vue3, esbuild用Vue3ローダー インストール

    ```bash
    yarn add -D vue esbuild-plugin-vue3
    ```

2. esbuild (`./esbuild.config.js`) 設定変更

    ```javascript
    const vuePlugin = require("esbuild-plugin-vue3")    // ← 追加

    module.exports = {
      plugins: [
        vuePlugin()  // ← 追加
      ]
    }
    ```

3. `./src/config.html`ファイルに要素ID`app`をもつ`div`要素を追記

    ```html
    <!-- ... 略 ... -->
      <div id="app"></div>
    <!-- ... 略 ... -->
    ```

4. `./src/config.js`でVue3を読込み

    ```javascript
    'use strict';
    import { createApp } from 'vue'
    import App from './config/App.vue'

    (function(PLUGIN_ID) {

      const config = kintone.plugin.app.getConfig(PLUGIN_ID);
      const app = createApp(App, { config })
      app.mount('#app')

    })(kintone.$PLUGIN_ID);
    ```

5. `./src/config/App.vue`を作成

    ```html
    <script setup>
    import { ref } from 'vue'
    const props = defineProps({
      config: { type: Object, default: () => ({}) },
    })
    const input = ref(props.config)

    const onSubmit = () => {
      kintone.plugin.app.setConfig(input.value)
    }
    </script>

    <template>
      <form @submit.prevent="onSubmit">
        <input v-model="input.message" />
      </form>
    </template>
    ```