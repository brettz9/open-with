/* eslint-disable no-console */
'use strict';
const {join, extname} = require('path');
const mdls = require('mdls');
const lsregister = require('lsregister');
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
  const {
    ItemContentTypeTree
  } = await mdls(filePath, '-name kMDItemContentTypeTree');
  console.log('Data', ItemContentTypeTree);
} catch (err) {
  console.log('Error', err);
}

// Todo: Use mdls data above with this lsregister below:
// eslint-disable-next-line max-len
// /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -dump | grep -n7 'public'
try {
  const result = await lsregister.dump();
  console.log('result', result.length);
  console.log('r', result.filter(({
    contentType, extension,
    uti, bindings, serviceId, uRLScheme,
    bundleClass, containerMountState, extPointID,
    claimId, volumeId // , ...others
  }) => {
    return contentType;
    /*
    return !bindings && !contentType && !extension &&
      !uti && !serviceId && !bundleClass && !containerMountState &&
      !extPointID && !uRLScheme && !claimId && !volumeId &&
      !Object.keys(others).some((item) => item.startsWith('pluginIdentif'));
    */
    // return bindings && (bindings.includes('.js') ||
    //    bindings.includes('javascript'));
  }));
} catch (err) {
  console.log('Error', err);
}
// return;

try {
  const macOSDefaults = new MacOSDefaults();
  const lsHandlers = await macOSDefaults.read({
    domain: 'com.apple.LaunchServices/com.apple.launchservices.secure',
    key: 'LSHandlers'
  });
  console.log('result', lsHandlers);

  // Todo: Also allow a filter from launchservices per mdls content-type results

  const ext = extname(filePath).slice(1);
  const matchingExtensions = lsHandlers.filter(({
    LSHandlerContentTagClass,
    LSHandlerContentTag
  }) => {
    return LSHandlerContentTagClass === 'public.filename-extension' &&
      LSHandlerContentTag === ext;
  });
  console.log('matchingExtensions', matchingExtensions);
} catch (err) {
  console.log('Err', err);
}
})();
