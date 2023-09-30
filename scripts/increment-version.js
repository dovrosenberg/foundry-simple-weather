/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const readline = require('readline');
const process = require('process');
const bumpVersion = require('semver-increment');

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let package = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' }));
let fvttModule = JSON.parse(fs.readFileSync('./static/module.json', { encoding: 'utf8' }));
const previousVersion = fvttModule.version;

rl.question('Which version to increment? 1: Major - 2: Minor - 3: Patch\n', function(answer) {
  const version = incrementVersion(answer);
  updateDownloadLink(version);
  console.log('\nThe version will become ', version);
  console.log('==============================\n');

  rl.question('Does this new version contain a notice? yes/no\n', function (answer) {
    if (answer === 'yes' || answer === 'y') {
      addVersionToNoticesList(version);
    }

    console.log('==============================');
    rl.question('\nDone! Press any key to write to disk or CTRL+C to cancel.', function() {
      writeToFile();
      rl.close();
    });
  });
});

function incrementVersion(answer) {
  let major = 0;
  let minor = 0;
  let patch = 0;

  switch(answer) {
  case '1':
    major = 1;
    break;

  case '2':
    minor = 1;
    break;

  case '3':
    patch = 1;
    break;
  }
  const mask = [major,minor,patch];

  if (isMaskValid(mask)) {
    const newVersion = bumpVersion(mask, fvttModule.version);
    package.version = newVersion;
    fvttModule.version = newVersion;

    return newVersion;
  } else {
    return fvttModule.version;
  }
}

function isMaskValid(mask) {
  let zeroCount = 0;
  for (var i = 0; i < mask.length; i++) {
    if (mask[i] === 0) {
      zeroCount++;
    }
  }

  return zeroCount !== 3;
}

function updateDownloadLink(newVersion) {
  let link = fvttModule.download;
  link = link.replace(previousVersion, newVersion);
  fvttModule.download = link;
}

function addVersionToNoticesList(newVersion) {
  fvttModule.versionsWithNotices.push(newVersion);
}

function writeToFile() {
  fs.writeFileSync('./package.json', JSON.stringify(package, null, 2));
  fs.writeFileSync('./static/module.json', JSON.stringify(fvttModule, null, 2));
}
