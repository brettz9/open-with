/* eslint-disable no-console */
'use strict';
const {join, extname} = require('path');
const mdls = require('mdls');
const lsregister = require('lsregister');
const {MacOSDefaults} = require('macos-defaults');
const OpenWith = require('../macOS-defaults/OpenWith');
const PlistParser = require('macos-defaults/PlistParser');

// const filePath = join(__dirname, 'index.js');
const filePath = join(__dirname, 'README.md');

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
return;

try {
  const {
    ItemContentTypeTree
  } = await mdls(filePath, '-name kMDItemContentTypeTree');
  console.log('kMDItemContentTypeTree', ItemContentTypeTree);
} catch (err) {
  console.log('Error', err);
}

// Todo: Use mdls data above with this lsregister below:
// eslint-disable-next-line max-len
// /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -dump | grep -n7 'public'
try {
  const result = await lsregister.dump();
  console.log('result', result.length);
  console.log('r', result.filter((item) => {
    const {
      plistCommon,
      contentType, extension,
      uti, bindings, serviceId, uRLScheme,
      bundleClass, containerMountState, extPointID,
      claimId, volumeId // , ...others
    } = item;
    return plistCommon && new PlistParser({plist: plistCommon}).start().CFBundleDocumentTypes;
    // return contentType;
    /*
    return !bindings && !contentType && !extension &&
      !uti && !serviceId && !bundleClass && !containerMountState &&
      !extPointID && !uRLScheme && !claimId && !volumeId &&
      !Object.keys(others).some((item) => item.startsWith('pluginIdentif'));
    */
    // return bindings && (bindings.includes('.js') ||
    //    bindings.includes('javascript'));
    // This is messed up, but onto the right track now
  }).map((i) => {
    return new PlistParser({plist: i.plistCommon}).start().CFBundleDocumentTypes.filter((dts) => {
      return dts.CFBundleTypeName &&
        (dts.LSItemContentTypes); // || dts.CFBundleTypeExtensions || dts.CFBundleTypeMIMETypes);
    }).map((dts) => {
      // return dts.CFBundleTypeName;
      return [dts.CFBundleTypeName, dts.LSItemContentTypes]; // || dts.CFBundleTypeExtensions;
    });
  }));
} catch (err) {
  console.log('Error', err);
}
return;

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
