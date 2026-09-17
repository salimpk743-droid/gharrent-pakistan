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

## What this first step does not include

- Website `/.well-known/assetlinks.json` (next step, after this project works)
- Play Store listing, signing key, or closed testing
- Service worker / offline mode
- Push notifications
- Camera / HEIC changes
- Any change to the website UI, auth, database, or posting form
