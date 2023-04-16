const fs    = require('fs')
const path  = require('path')
const NodeRSA = require('node-rsa')

const key = new NodeRSA({ b: 1024 });
const rsa = key.exportKey("pkcs1-private");
fs.writeFileSync(path.resolve(__dirname, '../private.ppk'), rsa)