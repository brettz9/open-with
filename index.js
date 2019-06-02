/* eslint-disable no-console */
'use strict';
const {join, extname} = require('path');
const mdls = require('mdls');
const lsregister = require('lsregister');
const {MacOSDefaults} = require('macos-defaults');
const OpenWith = require('macos-defaults/OpenWith');

// const filePath = join(__dirname, 'index.js');
const filePath = join(__dirname, 'README.md');
const ext = extname(filePath).slice(1);

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

let ItemContentTypeTree;
try {
  ({
    ItemContentTypeTree
  } = await mdls(filePath, '-name kMDItemContentTypeTree'));
  console.log('kMDItemContentTypeTree', ItemContentTypeTree);
} catch (err) {
  console.log('Error', err);
}

// eslint-disable-next-line max-len
// /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -dump | grep -n7 'public'
let contentTypeObj;
const exts = [];
const iconMap = new Map();
try {
  const result = await lsregister.dump();
  console.log('result', result.length);
  contentTypeObj = result.reduce((obj, item) => {
    const {
      plistCommon
      // contentType, extension,
      // uti, bindings, serviceId, uRLScheme,
      // bundleClass, containerMountState, extPointID,
      // claimId, volumeId // , ...others
    } = item;
    if (!plistCommon || !plistCommon.CFBundleDocumentTypes) {
      return obj;
    }
    if (!plistCommon.CFBundleDisplayName && !plistCommon.CFBundleName) {
      // Excludes `com.apple.system-library` and `com.apple.local-library`
      return obj;
    }
    const bundleName = plistCommon.CFBundleDisplayName ||
      plistCommon.CFBundleName;
    // CFBundleExecutable or CFBundleName seem similar? (use with `open -a`)
    // CFBundleIdentifier with `open -b`
    // return contentType;
    plistCommon.CFBundleDocumentTypes.forEach((dts) => {
      if (!dts.CFBundleTypeName ||
        (!dts.LSItemContentTypes && !dts.CFBundleTypeExtensions)) {
        return;
      }
      // console.log('item', Object.keys(item).filter((i) => i.includes('ic')));
      // console.log('item', item.iconName, item.iconFlags, item.icons);
      if (dts.CFBundleTypeExtensions && !dts.LSItemContentTypes) {
        // console.log('CFBundleTypeExtensions', dts);
        if (dts.CFBundleTypeExtensions.includes(ext)) {
          exts.push(bundleName);
          if (item.icons) {
            iconMap.set(bundleName, join(item.path, item.icons));
          }
          return;
        }
        return;
      }
      // If only has `CFBundleTypeName` is just a file type
      // console.log('item', plistCommon.CFBundleIdentifier, bundleName);
      dts.LSItemContentTypes.forEach((LSItemContentType) => {
        if (!obj[LSItemContentType]) {
          obj[LSItemContentType] = [];
        }
        if (item.icons) {
          iconMap.set(bundleName, join(item.path, item.icons));
        }
        // obj[LSItemContentType].push(plistCommon.CFBundleIdentifier);
        obj[LSItemContentType].push(bundleName); // .push(dts.CFBundleTypeName);
        // console.log('plistCommon', plistCommon.CFBundleIdentifier);
      });
      // || dts.CFBundleTypeExtensions || dts.CFBundleTypeMIMETypes);
    });
    return obj;
    /*
    return !bindings && !contentType && !extension &&
      !uti && !serviceId && !bundleClass && !containerMountState &&
      !extPointID && !uRLScheme && !claimId && !volumeId &&
      !Object.keys(others).some((item) => item.startsWith('pluginIdentif'));
    */
    // return bindings && (bindings.includes('.js') ||
    //    bindings.includes('javascript'));
    // This is messed up, but onto the right track now
  }, {});
  // console.log(JSON.stringify(contentTypeObj, null, 2));
} catch (err) {
  console.log('Error', err);
}

const appNames = [...new Set(ItemContentTypeTree.reduce((arr, item) => {
  if (!contentTypeObj[item]) {
    return arr;
  }
  return arr.concat(contentTypeObj[item]);
}, exts))].sort();
console.log('appNames', appNames);

// Todo: Use `@fiahfy/icns` to extract their PNG, etc. for HTML display?
console.log('appIcons', appNames.map((appName) => {
  return iconMap.get(appName);
}));

return;

try {
  const macOSDefaults = new MacOSDefaults();
  const lsHandlers = await macOSDefaults.read({
    domain: 'com.apple.LaunchServices/com.apple.launchservices.secure',
    key: 'LSHandlers'
  });
  console.log('result', lsHandlers);

  // Todo: Also allow a filter from launchservices per mdls content-type results

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
