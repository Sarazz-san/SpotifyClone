# Prochaines etapes APK + Firebase

## 1. Lancer l'app actuelle

Depuis la racine du projet:

```bash
npx react-native start --reset-cache
```

Dans un autre terminal:

```bash
npx react-native run-android
```

Si Android affichait une erreur rouge liée a `TrackPlayerModule`, le module natif audio a ete retire du runtime. Retire aussi le paquet pour empecher l'autolinking Android:

```bash
npm uninstall react-native-track-player
cd android
./gradlew clean
cd ..
npx react-native start --reset-cache
npx react-native run-android
```

Si tu utilises un telephone Android branche en USB:

```bash
adb reverse tcp:8081 tcp:8081
```

## 2. Generer l'APK debug

```bash
cd android
./gradlew :app:assembleDebug
```

APK attendu:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 3. Creer Firebase pour le TP

Dans Firebase Console:

1. Creer un projet.
2. Ajouter une app Android.
3. Utiliser ce package: `com.spotifyclone.mobile`.
4. Telecharger `google-services.json`.
5. Placer le fichier dans `android/app/google-services.json`.
6. Activer Authentication > Email/Password.
7. Creer Firestore Database.
8. Activer Storage.

Quand le fichier `google-services.json` est en place, on pourra activer le plugin Gradle Google Services et remplacer l'auth demo par Firebase Auth.

## 4. Donnees Firestore attendues

Collections minimales:

```text
tracks
playlists
categories
users/{userId}
users/{userId}/recentlyPlayed/{trackId}
```

Document `tracks/{trackId}`:

```json
{
  "title": "Quantum Shift",
  "artist": "Neo Pulse",
  "album": "Aurora Echo",
  "durationMs": 214000,
  "coverUrl": "https://...",
  "audioUrl": "https://..."
}
```

Document `playlists/{playlistId}`:

```json
{
  "title": "Cyberpunk Focus",
  "subtitle": "Playlist - Dark synth and deep focus",
  "coverUrl": "https://...",
  "trackIds": ["quantum-shift"],
  "category": "playlist",
  "pinned": true
}
```

Document `categories/{categoryId}`:

```json
{
  "name": "Music"
}
```

Document `users/{userId}`:

```json
{
  "email": "student@spotifyclone.tp",
  "displayName": "student",
  "updatedAt": "serverTimestamp"
}
```

Document `users/{userId}/recentlyPlayed/{trackId}`:

```json
{
  "trackId": "quantum-shift",
  "title": "Quantum Shift",
  "artist": "Neo Pulse",
  "album": "Aurora Echo",
  "playedAt": "serverTimestamp"
}
```

## 5. Regles Firestore temporaires pour TP

Pour tester rapidement, tu peux utiliser ces regles pendant le developpement:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /tracks/{document=**} {
      allow read, write: if request.auth != null;
    }

    match /playlists/{document=**} {
      allow read, write: if request.auth != null;
    }

    match /categories/{document=**} {
      allow read, write: if request.auth != null;
    }

    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 6. Etat actuel

L'application compile cote TypeScript et lint. Elle fonctionne en mode demo local:

- login/register local
- tabs Home/Search/Library
- player plein ecran
- mini-player global
- assets Stitch locaux
- donnees mockees dans `src/data/mockCatalog.ts`
- catalogue pret a lire Firestore avec fallback demo
- profil utilisateur Firebase cree dans `users/{userId}`
- lectures recentes ecrites dans `users/{userId}/recentlyPlayed`

Firebase est prepare, mais pas encore force au runtime pour eviter de casser l'APK avant la creation du projet Firebase.
