(function(PLUGIN_ID) {
  'use strict';

  kintone.events.on('mobile.app.record.index.show', function() {
    const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  });
})(kintone.$PLUGIN_ID);