/* eslint-disable no-console */
'use strict';
const {join} = require('path');
const OpenWith = require('macos-defaults/OpenWith');

(async () => {
try {
  const openWith = new OpenWith();
  const result = await openWith.getAsync(join(__dirname, 'index.js'));
  console.log('r', result);
} catch (err) {
  console.log('er', err);
}
})();
