/* eslint-disable no-console */
'use strict';
const {join} = require('path');
const mdls = require('mdls');
const OpenWith = require('macos-defaults/OpenWith');
const {MacOSDefaults} = require('macos-defaults');

const filePath = join(__dirname, 'index.js');

(async () => {
try {
  const openWith = new OpenWith();
  const {
    bundleidentifier, path
  } = await openWith.getAsync(filePath);
  console.log('bundleidentifier', bundleidentifier);
  console.log('path', path);
} catch (err) {
  console.log('er', err);
}

try {
  const data = await mdls(filePath, '-name kMDItemContentTypeTree');
  console.log('Data', data);
} catch (err) {
  console.log('Error', err);
}

try {
  const macOSDefaults = new MacOSDefaults();
  const result = await macOSDefaults.read({
    domain: 'com.apple.LaunchServices/com.apple.launchservices.secure',
    key: 'LSHandlers'
  });
  console.log('result', result);
} catch (err) {
  console.log('Err', err);
}
})();
