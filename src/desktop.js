import './style.css'

(function(PLUGIN_ID) {
  'use strict';

  kintone.events.on('app.record.index.show', function() {
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
  });
})(kintone.$PLUGIN_ID);