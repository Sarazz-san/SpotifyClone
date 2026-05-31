# ShakeUnlockApp

Application React Native qui se déverrouille par **secousses** (seuil dynamique selon le jour de la semaine) ou par **empreinte digitale**.

---

## 🚀 Installation et premier lancement

```bash
# 1. Cloner le dépôt
git clone https://github.com/ton-compte/ShakeUnlockApp.git
cd ShakeUnlockApp

# 2. Installer les dépendances
npm install

# 3. Lancer Metro (dans un terminal)
npx react-native start --reset-cache

# 4. Dans un autre terminal, lancer l'app
npx react-native run-android
```

> Sur un vrai appareil Android (USB) : exécute `adb reverse tcp:8081 tcp:8081` avant `run-android`

---

## 📁 Structure et rôle des modules

Le projet est découpé en **5 modules indépendants** qui communiquent via un contrat (`src/shared/interfaces.js`).  
Chaque module est développé sur sa propre branche.

### 🔐 `lockManager`
**Rôle** : Cœur de l'application. Gère l'état global (verrouillé / déverrouillé).  
**Apport** : Tous les autres modules lisent ou modifient cet état. C'est lui qui décide si l'écran verrouillé ou déverrouillé s'affiche.  
**Exporte** : `useLock()` (hook avec `isLocked`, `lock()`, `unlock()`)

### 📳 `shakeDetector`
**Rôle** : Détecte les secousses du téléphone et calcule le seuil requis selon le jour de la semaine.  
**Apport** : Permet de déverrouiller l'app sans toucher l'écran. Quand le nombre de secousses atteint le seuil, il demande à `lockManager` de déverrouiller.  
**Exporte** : `startListening()`, `stopListening()`

### 👆 `fingerprintScanner`
**Rôle** : Interface avec le capteur d'empreinte digitale du téléphone.  
**Apport** : Offre une seconde méthode de déverrouillage, plus classique et sécurisée. En cas de succès, il demande à `lockManager` de déverrouiller.  
**Exporte** : `scan()` (retourne une promesse), `isAvailable()`

### 🎨 `ui`
**Rôle** : Affiche l'interface utilisateur (écran verrouillé / déverrouillé).  
**Apport** : Rend l'app visible et interactive. Il affiche l'état fourni par `lockManager` et expose le bouton "Reverrouiller". Il ne contient **pas** la logique de déverrouillage.  
**Exporte** : `LockedScreen`, `UnlockedScreen`, `LockButton`

### 🔗 `integration` (toi, lead)
**Rôle** : Assemble tous les modules dans `App.js`.  
**Apport** : C'est le chef d'orchestre. Il branche les détecteurs pour qu'ils appellent `unlock()`, connecte l'UI à `useLock()`, et fait en sorte que le bouton "Reverrouiller" appelle `lock()`.  
**Exporte** : Rien de spécifique — c'est le point d'entrée final.

---

## 🌿 Branches associées

| Module | Branche |
|--------|---------|
| `lockManager` | `feat/lock-manager` |
| `shakeDetector` | `feat/shake-detector` |
| `fingerprintScanner` | `feat/fingerprint` |
| `ui` | `feat/ui` |
| `integration` | `feat/integration` |

```bash
git checkout feat/nom-de-votre-module
```

---

## 🧪 Tester son module indépendamment

Chacun peut tester son module seul grâce aux mocks.

**Exemple** : le module `ui` peut créer `src/mocks/mockLockManager.js` qui simule `useLock()` sans avoir besoin du vrai `lockManager`.

```javascript
// src/mocks/mockLockManager.js
export const useMockLock = () => ({
  isLocked: true,
  lock: () => console.log('[mock] lock'),
  unlock: () => console.log('[mock] unlock'),
});
```

Puis dans son code, il remplace temporairement l'import du vrai module par le mock.

---

## ⚠️ Règles d'or (pour éviter l'enfer à la fusion)

1. **Ne jamais** modifier le dossier d'un autre module.
2. **Ne jamais** modifier `src/shared/interfaces.js` sans validation du groupe.
3. **Committer régulièrement** sur sa propre branche.
4. **Ne pas merger** sur `main` sans accord du lead.

---

## 🔧 Dépendances principales

```bash
npm install react-native-biometrics   # pour fingerprintScanner
npm install react-native-shake        # pour shakeDetector
```

Ces librairies nécessitent une configuration spécifique Android/iOS — voir leur documentation officielle.

---
