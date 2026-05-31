import {getApps} from '@react-native-firebase/app';

export function isFirebaseConfigured() {
  return getApps().length > 0;
}
