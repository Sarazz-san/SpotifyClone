# Firebase setup for this TP

The APK currently runs with local demo data so the UI and audio flow can be built before the Firebase console is ready.

To switch to Firebase:

1. Create a Firebase project.
2. Add an Android app with package `com.spotifyclone.mobile`.
3. Download `google-services.json`.
4. Put it in `android/app/google-services.json`.
5. Add the Google Services classpath in `android/build.gradle`.
6. Apply `com.google.gms.google-services` in `android/app/build.gradle`.
7. Enable Authentication Email/Password, Firestore and Storage.

Keep `google-services.json` and release keystores out of Git for a real project.
