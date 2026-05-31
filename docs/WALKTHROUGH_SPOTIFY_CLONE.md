# Walkthrough Spotify Clone React Native CLI + Firebase

Objectif: partir du projet actuel et arriver a un APK Android installable, avec une application mobile complete basee sur les maquettes Stitch situees dans:

`/home/zepe/Téléchargements/stitch_spotify_mobile_clone`

Le projet est un React Native CLI, pas Expo. La cible principale de ce walkthrough est Android.

## 0. Etat de depart

Le repo contient actuellement:

- React Native `0.85.2`
- React `19.2.3`
- Android natif present dans `android/`
- `App.tsx` minimal avec un texte de test
- pas encore de navigation
- pas encore de Firebase
- pas encore de lecteur audio
- identifiant Android actuel: `com.testapp`

Les maquettes Stitch disponibles:

- `spotify_logo_green`: logo / splash / icone de marque
- `spotify_home_2025`: Home
- `spotify_search_2025`: Search
- `spotify_library_2025`: Library
- `spotify_player_2025`: Player
- assets de pochettes 1024x1024
- design system `sonic_immersion/DESIGN.md`

## 1. Definition du MVP complet

Le MVP doit etre fonctionnel sans dependre de l'API officielle Spotify. Firebase sert de backend.

Fonctionnalites minimales:

- Authentification email/password
- Home avec playlists, mixes, favoris et mini-player
- Search avec champ de recherche, categories et resultats
- Library avec playlists/albums sauvegardes
- Player plein ecran avec play/pause, progression, suivant/precedent
- Donnees chargees depuis Firestore
- Audio charge depuis Firebase Storage ou URLs publiques
- Persistance de session Firebase
- APK debug puis APK release signe

Hors MVP initial:

- streaming Spotify officiel
- recommandations algorithmiques avancees
- mode offline complet
- paiements / abonnement
- notifications push

## 2. Preparation du projet

Verifier l'environnement:

```bash
node -v
npm -v
npx react-native doctor
```

Installer les dependances de base:

```bash
npm install
```

Lancer une build Android propre avant modifications:

```bash
npx react-native start --reset-cache
npx react-native run-android
```

Si tu utilises un vrai telephone:

```bash
adb reverse tcp:8081 tcp:8081
```

## 3. Renommage Android avant Firebase

Avant de creer l'app Firebase, il faut fixer le vrai package Android. Exemple:

```text
com.spotifyclone.mobile
```

Fichiers a modifier:

- `android/app/build.gradle`
  - `namespace "com.spotifyclone.mobile"`
  - `applicationId "com.spotifyclone.mobile"`
- `android/app/src/main/java/com/testapp/`
  - deplacer vers `android/app/src/main/java/com/spotifyclone/mobile/`
  - mettre a jour le package Kotlin dans `MainActivity.kt` et `MainApplication.kt`
- `android/settings.gradle`
  - remplacer `rootProject.name = 'TestApp'` par `rootProject.name = 'SpotifyClone'`
- `app.json`
  - aligner `name` et `displayName`

Tester apres renommage:

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 4. Installation des dependances app

Navigation:

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
```

Firebase React Native:

```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage
```

Audio pour une version ulterieure:

```bash
# Le prototype actuel utilise un player JS simule pour eviter les conflits natifs.
# Ajouter une vraie lib audio seulement apres validation APK/Firebase.
```

UI utile:

```bash
npm install react-native-linear-gradient react-native-reanimated react-native-gesture-handler
npm install react-native-vector-icons
```

Puis rebuild natif:

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 5. Configuration Firebase Android

Dans Firebase Console:

1. Creer un projet Firebase
2. Ajouter une application Android avec le package choisi, par exemple `com.spotifyclone.mobile`
3. Telecharger `google-services.json`
4. Placer le fichier ici:

```text
android/app/google-services.json
```

Modifier `android/build.gradle`:

```gradle
dependencies {
    classpath("com.android.tools.build:gradle")
    classpath("com.facebook.react:react-native-gradle-plugin")
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    classpath("com.google.gms:google-services:4.4.2")
}
```

Modifier `android/app/build.gradle` en haut du fichier:

```gradle
apply plugin: "com.google.gms.google-services"
```

Activer dans Firebase Console:

- Authentication > Email/Password
- Firestore Database
- Storage

## 6. Structure cible du code

Structure recommandee:

```text
src/
  app/
    AppNavigator.tsx
    AuthNavigator.tsx
    MainTabs.tsx
  assets/
    images/
  components/
    AlbumCard.tsx
    BottomMiniPlayer.tsx
    CategoryChip.tsx
    IconButton.tsx
    TrackRow.tsx
  constants/
    colors.ts
    spacing.ts
    typography.ts
  data/
    mockCatalog.ts
  features/
    auth/
      LoginScreen.tsx
      RegisterScreen.tsx
      authService.ts
    home/
      HomeScreen.tsx
    library/
      LibraryScreen.tsx
    player/
      PlayerScreen.tsx
      playerService.ts
      playerStore.ts
    search/
      SearchScreen.tsx
  firebase/
    firebaseCollections.ts
    firebaseServices.ts
  models/
    Album.ts
    Playlist.ts
    Track.ts
    UserProfile.ts
```

`App.tsx` doit devenir un point d'entree fin:

```tsx
import React from 'react';
import {AppNavigator} from './src/app/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
```

## 7. Traduction des maquettes Stitch en React Native

Design tokens a reprendre depuis `sonic_immersion/DESIGN.md`:

- background: `#121414`
- primary: `#53e076`
- primary container: `#1db954`
- surface container: `#1e2020`
- surface high: `#282a2b`
- text primary: `#e2e2e2`
- text secondary: `#bccbb9`
- base spacing: `8`
- margin mobile: `16`
- radius cards: `8`

Mapping ecrans:

- `spotify_home_2025/code.html` -> `HomeScreen.tsx`
- `spotify_search_2025/code.html` -> `SearchScreen.tsx`
- `spotify_library_2025/code.html` -> `LibraryScreen.tsx`
- `spotify_player_2025/code.html` -> `PlayerScreen.tsx`

Regles de conversion:

- `div` -> `View`
- `img` -> `Image`
- `button` -> `Pressable`
- `header/nav/main/section` -> `View`
- `overflow-x-auto` -> `ScrollView horizontal`
- grille 2 colonnes -> `FlatList numColumns={2}` ou `View` flex wrap
- bottom nav fixe -> React Navigation bottom tabs
- mini-player flottant -> composant global au-dessus des tabs
- `backdrop-filter` HTML -> approximation RN avec surface semi-transparente

## 8. Assets

Copier les images utiles dans:

```text
src/assets/images/
```

Sources:

- `spotify_logo_green/screen.png`
- `modern_abstract_album_art_with_vibrant_gradients_neon_highlights_organic_shapes/screen.png`
- `moody_synthwave_album_cover_dark_charcoal_background_with_high_saturation_pink/screen.png`
- `a_stylized_daylist_cover_for_spotify_iridescent_pearlescent_gradients_shifting/screen.png`
- `high_quality_podcast_cover_art_minimalist_design_with_bold_typography_daily/screen.png`

Nommer les fichiers simplement:

```text
logo_spotify_green.png
cover_abstract_neon.png
cover_synthwave.png
cover_daylist.png
cover_daily_podcast.png
```

Pour une premiere version, utiliser ces assets locaux. Ensuite, pousser les vrais fichiers audio/images dans Firebase Storage.

## 9. Modele Firestore

Collections recommandees:

```text
users/{userId}
tracks/{trackId}
albums/{albumId}
playlists/{playlistId}
categories/{categoryId}
users/{userId}/library/{itemId}
users/{userId}/recentlyPlayed/{trackId}
```

Exemple `tracks`:

```json
{
  "title": "Quantum Shift",
  "artist": "Neo Pulse",
  "albumId": "album_quantum",
  "coverUrl": "https://...",
  "audioUrl": "https://...",
  "durationMs": 214000,
  "genre": "Electronic",
  "createdAt": "serverTimestamp"
}
```

Exemple `playlists`:

```json
{
  "title": "Cyberpunk Focus",
  "description": "Dark synth and deep focus",
  "coverUrl": "https://...",
  "trackIds": ["track_1", "track_2"],
  "ownerId": "system",
  "isPublic": true
}
```

## 10. Ordre d'implementation

Phase 1: fondation app

- renommer package Android
- installer navigation
- creer theme global
- creer `AppNavigator`
- creer tabs Home/Search/Library
- brancher les ecrans vides

Phase 2: UI statique depuis Stitch

- creer composants partages: chip, card, row, mini-player
- convertir Home
- convertir Search
- convertir Library
- convertir Player
- ajouter assets locaux

Phase 3: Firebase

- installer et configurer Firebase natif
- brancher Auth email/password
- creer services Firestore
- creer seed manuel de donnees
- remplacer `mockCatalog.ts` par Firestore progressivement

Phase 4: audio

- remplacer le player JS simule par une librairie audio compatible avec la version RN du projet
- creer queue de tracks
- brancher play/pause
- brancher progress bar
- ouvrir `PlayerScreen` depuis mini-player
- enregistrer recently played dans Firestore

Phase 5: qualite APK

- gerer loading/error/empty states
- verifier responsive Android
- verifier permissions et network security
- generer icone/splash
- configurer signature release
- produire APK

## 11. Tests manuels indispensables

Avant APK:

- creation compte
- connexion/deconnexion
- persistance de session apres fermeture app
- Home charge les donnees
- Search filtre les tracks/categories
- Library ajoute/retire un item
- Player lit un audio
- pause/reprise fonctionne
- suivant/precedent fonctionne
- mini-player reste visible sur Home/Search/Library
- app redemarre sans crash

Commandes utiles:

```bash
npm run lint
npm test
npx react-native run-android
```

Build debug:

```bash
cd android
./gradlew assembleDebug
```

APK debug:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 12. Signature release

Generer une keystore:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore spotifyclone-release.keystore -alias spotifyclone -keyalg RSA -keysize 2048 -validity 10000
```

Placer la keystore dans:

```text
android/app/spotifyclone-release.keystore
```

Ajouter dans `android/gradle.properties`:

```properties
SPOTIFYCLONE_UPLOAD_STORE_FILE=spotifyclone-release.keystore
SPOTIFYCLONE_UPLOAD_KEY_ALIAS=spotifyclone
SPOTIFYCLONE_UPLOAD_STORE_PASSWORD=*****
SPOTIFYCLONE_UPLOAD_KEY_PASSWORD=*****
```

Modifier `android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        if (project.hasProperty('SPOTIFYCLONE_UPLOAD_STORE_FILE')) {
            storeFile file(SPOTIFYCLONE_UPLOAD_STORE_FILE)
            storePassword SPOTIFYCLONE_UPLOAD_STORE_PASSWORD
            keyAlias SPOTIFYCLONE_UPLOAD_KEY_ALIAS
            keyPassword SPOTIFYCLONE_UPLOAD_KEY_PASSWORD
        }
    }
}
```

Puis dans `buildTypes.release`:

```gradle
signingConfig signingConfigs.release
minifyEnabled false
```

Generer l'APK release:

```bash
cd android
./gradlew assembleRelease
```

APK release:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## 13. Definition du "complet"

On considere l'APK complet lorsque:

- l'utilisateur peut creer un compte Firebase
- l'utilisateur peut se connecter
- les ecrans Home/Search/Library/Player correspondent aux maquettes
- les donnees viennent de Firestore ou d'un seed local clairement remplaceable
- au moins une piste audio est lisible
- le mini-player et le player plein ecran sont synchronises
- l'APK debug s'installe
- l'APK release signe se genere
- aucun secret Firebase/keystore n'est commit

## 14. Premiere tache a faire maintenant

La premiere tache concrete est la fondation:

1. Renommer le package Android
2. Installer navigation + Firebase + audio
3. Creer `src/constants/*`
4. Creer `src/app/AppNavigator.tsx`
5. Remplacer `App.tsx`
6. Afficher les 3 tabs vides
7. Rebuild Android

Une fois cette base stable, la conversion des maquettes Stitch peut se faire ecran par ecran sans casser le socle natif.
