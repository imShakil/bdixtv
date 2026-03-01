#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function ensureMatch(content, regex, label) {
  if (!regex.test(content)) {
    fail(`Could not find ${label}`);
  }
}

function replaceSingle(content, regex, replacement, label) {
  ensureMatch(content, regex, label);
  return content.replace(regex, replacement);
}

function replaceAll(content, regex, replacement, label) {
  const matches = content.match(regex);
  if (!matches || matches.length === 0) {
    fail(`Could not find ${label}`);
  }
  return {
    content: content.replace(regex, replacement),
    count: matches.length
  };
}

function validateInput(version, build) {
  const semverPattern = /^\d+\.\d+\.\d+$/;
  if (!semverPattern.test(version)) {
    fail(`Invalid version "${version}". Expected format: x.y.z`);
  }

  if (!/^\d+$/.test(build)) {
    fail(`Invalid build number "${build}". Expected a positive integer.`);
  }

  const buildNumber = Number(build);
  if (!Number.isInteger(buildNumber) || buildNumber <= 0) {
    fail(`Invalid build number "${build}". Expected a positive integer.`);
  }

  return buildNumber;
}

function main() {
  const [, , versionArg, buildArg] = process.argv;
  if (!versionArg || !buildArg) {
    fail('Usage: node scripts/set-release-version.js <version x.y.z> <buildNumber>');
  }

  const buildNumber = validateInput(versionArg, buildArg);

  const root = path.resolve(__dirname, '..');
  const packageJsonPath = path.join(root, 'package.json');
  const androidGradlePath = path.join(root, 'mobile-app/android/app/build.gradle');
  const iosProjectPath = path.join(root, 'mobile-app/ios/App/App.xcodeproj/project.pbxproj');

  const packageJson = JSON.parse(readText(packageJsonPath));
  packageJson.version = versionArg;
  writeText(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  let androidGradle = readText(androidGradlePath);
  androidGradle = replaceSingle(
    androidGradle,
    /(\bversionCode\s+)\d+/,
    `$1${buildNumber}`,
    'Android versionCode'
  );
  androidGradle = replaceSingle(
    androidGradle,
    /(\bversionName\s+")([^"]+)(")/,
    `$1${versionArg}$3`,
    'Android versionName'
  );
  writeText(androidGradlePath, androidGradle);

  let iosProject = readText(iosProjectPath);
  const marketingResult = replaceAll(
    iosProject,
    /(\bMARKETING_VERSION = )[^;]+;/g,
    `$1${versionArg};`,
    'iOS MARKETING_VERSION'
  );
  iosProject = marketingResult.content;
  const buildResult = replaceAll(
    iosProject,
    /(\bCURRENT_PROJECT_VERSION = )[^;]+;/g,
    `$1${buildNumber};`,
    'iOS CURRENT_PROJECT_VERSION'
  );
  iosProject = buildResult.content;
  writeText(iosProjectPath, iosProject);

  console.log(`Updated release version to ${versionArg} (build ${buildNumber}).`);
  console.log(`iOS MARKETING_VERSION entries: ${marketingResult.count}`);
  console.log(`iOS CURRENT_PROJECT_VERSION entries: ${buildResult.count}`);
  console.log('Files updated:');
  console.log('- package.json');
  console.log('- mobile-app/android/app/build.gradle');
  console.log('- mobile-app/ios/App/App.xcodeproj/project.pbxproj');
}

main();
