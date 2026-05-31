# Catalogue musical Firebase

L’application ne lit plus un timer fictif : le player consomme maintenant le champ `audioUrl` des documents Firestore `tracks`.

## Structure Firestore

Collection `tracks` :

```json
{
  "title": "Nom du titre",
  "artist": "Nom de l’artiste",
  "album": "Nom de l’album",
  "durationMs": 214000,
  "coverUrl": "https://.../cover.jpg",
  "audioUrl": "https://.../song.mp3"
}
```

Collection `playlists` :

```json
{
  "title": "Nom playlist",
  "subtitle": "Playlist • Votre nom",
  "coverUrl": "https://.../cover.jpg",
  "trackIds": ["track_id_1", "track_id_2"],
  "category": "playlist",
  "pinned": true
}
```

Collection `categories` :

```json
{
  "name": "Music"
}
```

## Workflow conseillé

1. Dans Firebase Storage, créer un dossier `tracks/` pour les fichiers `.mp3` et un dossier `covers/` pour les images.
2. Téléverser vos fichiers audio et pochettes.
3. Récupérer l’URL de téléchargement de chaque fichier.
4. Créer les documents Firestore `tracks` avec `audioUrl` et `coverUrl`.
5. Créer les playlists avec les `trackIds` correspondants.

Pour un TP, utilisez uniquement des morceaux libres de droits ou vos propres fichiers audio.

## Minimum viable pour entendre de la musique

Crée d’abord un seul document Firestore `tracks/demo_real_track` avec une URL audio valide :

```json
{
  "title": "Mon premier titre",
  "artist": "Artiste TP",
  "album": "Session Firebase",
  "durationMs": 180000,
  "coverUrl": "URL_DE_TELECHARGEMENT_DE_L_IMAGE",
  "audioUrl": "URL_DE_TELECHARGEMENT_DU_MP3"
}
```

Si `audioUrl` est vide, l’interface affiche le titre mais le player refusera la lecture. C’est volontaire : on ne masque plus les problèmes avec des données fictives.

## Règles Storage temporaires pour TP

Pendant le développement, si tu veux tester vite avec des fichiers publics :

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tracks/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /covers/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

À durcir avant tout usage hors TP.
