import {isFirebaseConfigured} from './firebaseAvailability';

export type FirebaseStatus = {
  mode: 'demo' | 'firebase';
  message: string;
};

export function getFirebaseStatus(): FirebaseStatus {
  if (isFirebaseConfigured()) {
    return {
      mode: 'firebase',
      message: 'Connexion aux services établie.',
    };
  }

  return {
    mode: 'demo',
    message:
      'L’application est actuellement en mode déconnecté. Certaines fonctionnalités nécessitent une configuration supplémentaire.',
  };
}
