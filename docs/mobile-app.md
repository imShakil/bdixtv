# Build Mobile App

## Android

```bash
npm run build
npx cap sync android
cd mobile-app/android
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ./gradlew assembleDebug
```

## IOS

```bash
cd /Users/imshakil/bdiptv
npm run build
npx cap sync ios
cd mobile-app/ios/App
env -u GEM_HOME -u GEM_PATH pod install --repo-update
open App.xcworkspace
```
