# SpotifyClone

Une application mobile de streaming musical inspirée de Spotify, développée avec **React Native** et **TypeScript**.

---

## 🚀 Fonctionnalités actuelles

- **Authentification** : Intégration avec Firebase Auth pour la gestion des utilisateurs.
- **Catalogue Musical** : Navigation dans les playlists, albums et titres.
- **Lecteur Audio** : Lecteur mini et plein écran avec contrôles de lecture.
- **Base de données** : Utilisation de Firebase Firestore pour stocker les données du catalogue.
- **Interface UI** : Composants stylisés (AlbumCard, TrackRow, BottomMiniPlayer, etc.) utilisant Linear Gradient et Vector Icons.

---

## 📁 Structure du projet

L'architecture suit une approche modulaire basée sur les fonctionnalités (`features`) :

- `src/app` : Configuration de la navigation (React Navigation).
- `src/components` : Composants UI réutilisables.
- `src/constants` : Thèmes de couleurs, typographie et espacements.
- `src/features` : Logique métier découpée par domaine (auth, catalog, player, search, etc.).
- `src/firebase` : Configuration et services liés à Firebase.
- `src/models` : Définitions des modèles de données (Track, Playlist).
- `src/assets` : Images et ressources statiques.

---

## 🛠️ Installation et Lancement

```bash
# 1. Cloner le dépôt
git clone https://github.com/Sarazz-san/SpotifyClone.git
cd SpotifyClone

# 2. Installer les dépendances
npm install

# 3. Lancer Metro (dans un terminal)
npm start

# 4. Lancer sur Android
npm run android

# 5. Lancer sur iOS
npm run ios
```

---

## 🔧 Technologies utilisées

- **React Native** (0.85.2)
- **TypeScript**
- **Firebase** (App, Auth, Firestore)
- **React Navigation** (Native, Stack, Bottom Tabs)
- **React Native Video** (pour la lecture audio/vidéo)
- **Lucide React Native / Vector Icons**

---

## 📝 À faire / Prochaines étapes

- [ ] Finaliser l'intégration de la recherche.
- [ ] Ajouter la gestion des favoris.
- [ ] Optimiser les performances du lecteur audio.
- [ ] Améliorer le design des écrans de détails d'album.
