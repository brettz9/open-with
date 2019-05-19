/* eslint-disable no-console */
'use strict';
const {join} = require('path');
const mdls = require('mdls');
const OpenWith = require('macos-defaults/OpenWith');

(async () => {
try {
  const openWith = new OpenWith();
  const {
    bundleidentifier, path
  } = await openWith.getAsync(join(__dirname, 'index.js'));
  console.log('bundleidentifier', bundleidentifier);
  console.log('path', path);
} catch (err) {
  console.log('er', err);
}

try {
  const data = await mdls('./index.js', '-name kMDItemContentTypeTree');
  console.log('Data', data);
} catch (err) {
  console.log('Error', err);
}
})();
