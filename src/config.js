// import './style.css'

(function(PLUGIN_ID) {
  'use strict';
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);

  kintone.plugin.app.setConfig({message: 'hello world'})
})(kintone.$PLUGIN_ID);