# Violet Music — Spotify Clone

Application mobile **React Native (CLI)** inspirée de Spotify, avec un thème
violet/sombre. Le backend est assuré par **Firebase** (authentification,
Firestore, Storage), et l'application fonctionne avec des données de démo locales
tant que la console Firebase n'est pas configurée.

> Cible principale : **Android**. iOS est présent mais n'est pas la plateforme
> de référence de ce projet.

---

## Fonctionnalités

- **Authentification** email / mot de passe avec persistance de session
- **Accueil** : playlists, mixes, écoutes récentes et mini-player
- **Recherche** : champ de recherche, catégories, genres et résultats
- **Bibliothèque** : playlists / albums sauvegardés, titres likés
- **Lecteur plein écran** : lecture/pause, progression, précédent/suivant
- **Détails** : playlist, artiste, catégorie, genre
- **Création** de playlists et ajout de titres
- **Espace Admin** : ajout de titres, catégories (avec image) et genres
- **Premium** : écran d'abonnement (vitrine)

---

## Stack technique

| Domaine | Technologie |
|--------|-------------|
| Framework | React Native `0.85.2` / React `19.2.3` |
| Langage | TypeScript |
| Navigation | `@react-navigation` (native-stack + bottom-tabs) |
| Backend | Firebase (`@react-native-firebase` auth / firestore) |
| UI | `react-native-linear-gradient`, `react-native-vector-icons` |
| Lecture vidéo/audio | `react-native-video` |
| Tests | Jest |

---

## Prérequis

- **Node.js >= 22.11.0**
- JDK 17 et le SDK Android (configurés pour le développement React Native)
- Un émulateur Android ou un appareil physique

Vérifier l'environnement :

```bash
node -v
npx react-native doctor
```

---

## Installation et lancement

```bash
# 1. Cloner le dépôt
git clone https://github.com/Sarazz-san/SpotifyClone.git
cd SpotifyClone

# 2. Installer les dépendances (applique aussi les patches via patch-package)
npm install

# 3. Lancer Metro (dans un terminal)
npm start

# 4. Dans un autre terminal, lancer l'app Android
npm run android
```

> Sur un appareil Android branché en USB, exécuter
> `adb reverse tcp:8081 tcp:8081` avant `npm run android`.

---

## Scripts npm

| Script | Description |
|--------|-------------|
| `npm start` | Démarre le bundler Metro |
| `npm run android` | Build et lance l'app sur Android |
| `npm run ios` | Build et lance l'app sur iOS |
| `npm test` | Exécute les tests Jest |
| `npm run lint` | Analyse le code avec ESLint |

---

## Structure du projet

```text
src/
  app/          Navigation (AppNavigator, AuthNavigator, MainTabs)
  assets/       Images et logos
  components/   Composants réutilisables (TrackRow, AlbumCard, mini-player…)
  constants/    Thème (couleurs, espacements, typographie)
  features/     Fonctionnalités par domaine
    admin/      Espace administrateur (catalogue, genres)
    auth/       Connexion et contexte d'authentification
    catalog/    Catalogue (playlists, artistes, catégories)
    create/     Création de playlists
    genre/      Écran par genre
    home/       Accueil et écoutes récentes
    library/    Bibliothèque et titres likés
    player/     Lecteur et contexte de lecture
    premium/    Écran d'abonnement
    search/     Recherche
    user/       Service utilisateur
  firebase/     Configuration et helpers Firebase
  models/       Types de données (Track, Playlist)
  utils/        Utilitaires (parsing métadonnées, messages d'erreur)
```

L'arborescence des providers est définie dans `App.tsx` :
`AuthProvider` → `CatalogProvider` → `PlayerProvider` → `AppNavigator`.

---

## Configuration Firebase

L'application tourne avec des **données de démo locales** par défaut, ce qui
permet de construire l'UI et le flux audio avant que la console Firebase ne soit
prête. Pour activer Firebase :

1. Créer un projet Firebase.
2. Ajouter une application Android avec le package `com.spotifyclone.mobile`.
3. Télécharger `google-services.json` et le placer dans `android/app/`.
4. Ajouter le classpath Google Services dans `android/build.gradle`.
5. Appliquer `com.google.gms.google-services` dans `android/app/build.gradle`.
6. Activer **Authentication (Email/Password)**, **Firestore** et **Storage**.

> Ne jamais committer `google-services.json` ni les keystores de release.

Plus de détails dans [`src/firebase/README.md`](src/firebase/README.md) et
[`docs/firebase-music-catalog.md`](docs/firebase-music-catalog.md).

---

## Build APK

- **CI** : le workflow [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml)
  produit des APK debug et release à chaque push / PR sur `master`.
- **Local (release signé)** : suivre [`docs/RELEASE_GUIDE.md`](docs/RELEASE_GUIDE.md).

---

## Documentation

- [`docs/WALKTHROUGH_SPOTIFY_CLONE.md`](docs/WALKTHROUGH_SPOTIFY_CLONE.md) — guide complet du projet
- [`docs/RELEASE_GUIDE.md`](docs/RELEASE_GUIDE.md) — génération d'un APK release signé
- [`docs/NEXT_STEPS_APK_FIREBASE.md`](docs/NEXT_STEPS_APK_FIREBASE.md) — prochaines étapes APK / Firebase
- [`docs/firebase-music-catalog.md`](docs/firebase-music-catalog.md) — modèle du catalogue Firebase
