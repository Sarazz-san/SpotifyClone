# Guide de Production APK Release - Spotify Clone

Ce guide vous explique comment générer un fichier APK prêt pour l'installation sur un téléphone Android.

## 1. Génération de la clé de signature (Keystore)

Si vous n'avez pas encore de clé, lancez cette commande dans votre terminal :

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore spotifyclone-release.keystore -alias spotifyclone -keyalg RSA -keysize 2048 -validity 10000
```

**Note :** Conservez bien le mot de passe que vous allez choisir.

Placez le fichier `spotifyclone-release.keystore` dans le dossier :
`android/app/`

## 2. Configuration de Gradle

Ouvrez le fichier `android/gradle.properties` et ajoutez les lignes suivantes (en remplaçant par votre mot de passe) :

```properties
MYAPP_RELEASE_STORE_FILE=spotifyclone-release.keystore
MYAPP_RELEASE_KEY_ALIAS=spotifyclone
MYAPP_RELEASE_STORE_PASSWORD=VOTRE_MOT_DE_PASSE
MYAPP_RELEASE_KEY_PASSWORD=VOTRE_MOT_DE_PASSE
```

## 3. Modification de android/app/build.gradle

Vérifiez que la section `signingConfigs` ressemble à ceci :

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}

buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        signingConfig signingConfigs.release
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

## 4. Génération de l'APK

Lancez les commandes suivantes dans votre terminal :

```bash
cd android
./gradlew clean
./gradlew assembleRelease --no-daemon -Dorg.gradle.workers.max=1
```

## 5. Localisation de l'APK

Une fois terminé, votre APK se trouvera ici :
`android/app/build/outputs/apk/release/app-release.apk`

Vous pouvez maintenant copier ce fichier sur votre téléphone pour l'installer !

---
### Rappel Sécurité
Ne partagez jamais votre fichier `.keystore` et ne le committez pas sur un repo public.
