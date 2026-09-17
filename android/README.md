# GharRent Pakistan — Android TWA

This folder is a **Trusted Web Activity** shell for the existing GharRent website.

It does **not** contain a copy of the marketplace UI, Capacitor, or a `capacitor://` origin.
The Play Store app opens the live site:

**https://gharrent-pakistan.vercel.app/**

Same users, listings, Better Auth Google redirect, and mobile layout as the website.

| | |
| --- | --- |
| Application ID | `pk.gharrent.app` |
| Start URL | `https://gharrent-pakistan.vercel.app/` |
| Host | `gharrent-pakistan.vercel.app` |
| Fallback if Digital Asset Links are not yet verified | Chrome Custom Tabs (address bar may show until `assetlinks.json` is added on the website) |
| Notifications | Off |
| Capacitor | Not used |

## Build

Requires JDK 17 and an Android SDK (compile/target API 35).

```bash
export JAVA_HOME="$(dirname "$(dirname "$(readlink -f "$(which java)")")")"
export ANDROID_HOME=/path/to/android-sdk
cd android
./gradlew :app:assembleDebug
```

The debug APK is written to `app/build/outputs/apk/debug/`.

## Release signing (local upload keystore)

Play-installed users are signed by **Google Play App Signing**. That certificate is already in the website Digital Asset Links file. Do not put the upload-key fingerprint there.

To sign the AAB you upload to Play Console, copy [`keystore.properties.example`](keystore.properties.example) to **`keystore.properties`** in this folder (gitignored) on the Windows PC that has the upload keystore. Fill in the local `.p12` path and passwords. Never commit `keystore.properties`, `*.p12`, or passwords.

Without that file, debug builds still work. Release signing is applied only when the local keystore file exists.

## What this first step does not include

- Play Store listing, closed testing, or generating a signed AAB in CI
- Service worker / offline mode
- Push notifications
- Camera / HEIC changes
- Any change to the website UI, auth, database, or posting form
