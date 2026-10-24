# Build Word Ninja APK on GitHub Actions

This project is prepared to build an installable Android **debug APK** with the landscape controls, local Phaser assets, and a bundled offline English–Vietnamese SQLite dictionary.

## One-time setup

1. Create a GitHub repository and upload the contents of this project folder to the `main` branch.
2. Ensure `.github/workflows/android-apk.yml` remains in the repository. GitHub Actions must be enabled for that repository.
3. Open the **Actions** tab and choose **Build Word Ninja Android APK**. Select **Run workflow**.

## Get the APK

When the run succeeds, open the completed workflow run and download the artifact `word-ninja-android-debug-apk`. It is a ZIP containing `app-debug.apk`. Extract it, copy `app-debug.apk` to the Android device, and open it to install.

This is a debug APK intended for testing and sideloading. It is not signed with a personal release key and is not ready for publishing to Google Play.

## What the workflow does

- Installs Node.js, Java, and Android SDK build tools.
- Downloads the offline SQLite dictionary and its upstream CC BY-SA 4.0 attribution file.
- Bundles Phaser, sql.js/WebAssembly, game audio/fonts, and the dictionary as local app assets.
- Sets the Android activity to landscape orientation.
- Runs syntax checks and tests, then builds `assembleDebug` and uploads the APK.

The build needs outbound network access to npm, Android SDK distribution servers, and the upstream dictionary repository. The local environment that prepared this ZIP did not have those network/build dependencies, so an APK has not yet been generated here; the APK is produced by the GitHub Actions run.
