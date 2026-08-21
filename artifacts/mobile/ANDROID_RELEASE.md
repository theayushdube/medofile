# Android Release Checklist

## Release identity

- Application ID: `com.medofile.app`
- First release version: `1.0.0`
- First Android version code: `1`
- Production API: `https://medofile.com/api`

The application ID is the permanent identity of the app in Google Play. Do not change it after the first Play Console release. Increase `versionCode` for every later Android App Bundle upload.

## Test on a phone

1. Start the Medofile mobile workflow in Replit.
2. Install Expo Go from Google Play on an Android phone.
3. Scan the workflow QR code with Expo Go.
4. Test doctor discovery, Health Assistant replies, prescription uploads, booking, and profile management against the production website/API before creating a release.

Expo Go is for development testing. It does not create an installable Medofile APK.

## Create the release file

Google Play accepts an Android App Bundle (`.aab`) for store releases. Generate the signed bundle through an Android build provider or a local Android release environment using this project.

- Use a managed Android signing key or upload key from the chosen build provider.
- Keep signing credentials outside this repository and never place them in chat.
- Download the finished `.aab` and retain it with the corresponding version code.
- If you need a directly installable test build for a phone, create a signed APK through the same release environment. APKs are for direct installation; AABs are for Google Play.

## Publish through Google Play Console

1. Create the Medofile app in Google Play Console using `com.medofile.app`.
2. Start with the Internal testing track and upload the signed `.aab`.
3. Add test users, release notes, and verify installation on a physical Android phone.
4. Complete the required Store Listing, App Content, Data Safety, privacy policy, and contact-information sections.
5. Promote the tested release to Closed testing, Open testing, or Production when ready.

Before each new store upload, update the application version and increment `android.versionCode` in `app.json`.