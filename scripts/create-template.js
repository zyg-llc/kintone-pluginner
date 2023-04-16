const fs = require('fs')
const NodeRSA = require('node-rsa')
const key = new NodeRSA()

const dirs = [ 'css', 'html', 'image', 'js' ]
const dir = '../src'
if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

for (const dirName of dirs) {
  fs.mkdirSync(`${dir}/${dirName}`, { recursive: true })

  const exist = setInterval(() => {
    if (fs.existsSync(`${dir}/${dirName}`)) {
      create(dir, dirName)
      clearInterval(exist)
    }
  }, 100)
}

fs.writeFileSync('../private.ppk', key)

function create(dir, type) {
  if (type == 'html') {
    fs.writeFileSync(dir+'/js/desktop.js', `
      <section class="settings">
        <h2 class="settings-heading">Settings for test</h2>
        <p class="kintoneplugin-desc">This message is displayed on the app page after the app has been updated.</p>
        <form class="js-submit-settings">
          <p class="kintoneplugin-row">
            <label for="message">
              Message:
              <input type="text" class="js-text-message kintoneplugin-input-text">
            </label>
          </p>
          <p class="kintoneplugin-row">
              <button type="button" class="js-cancel-button kintoneplugin-button-dialog-cancel">Cancel</button>
              <button class="kintoneplugin-button-dialog-ok">Save</button>
          </p>
        </form>
      </section>
    `)
  } else if (type == 'js') {
    fs.writeFileSync(dir+'/js/desktop.js', `
    (function(PLUGIN_ID) {
      'use strict';

      kintone.events.on('app.record.index.show', function() {
        var config = kintone.plugin.app.getConfig(PLUGIN_ID);
      });
    })(kintone.$PLUGIN_ID);
    `)

    fs.writeFileSync(dir+'/js/mobile.js', `
    (function(PLUGIN_ID) {
      'use strict';

      kintone.events.on('mobile.app.record.index.show', function() {
        var config = kintone.plugin.app.getConfig(PLUGIN_ID);
      });
    })(kintone.$PLUGIN_ID);
    `)

    fs.writeFileSync(dir+'/js/config.js', `
    (function(PLUGIN_ID) {
      'use strict';
      const config = kintone.plugin.app.getConfig(PLUGIN_ID);

      kintone.plugin.app.setConfig({message: 'hello world'})
    })(kintone.$PLUGIN_ID);
    `)
  }
}
