import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppNavigator} from './src/app/AppNavigator';
import {colors} from './src/constants/colors';
import {AuthProvider} from './src/features/auth/AuthContext';
import {CatalogProvider} from './src/features/catalog/CatalogContext';
import {PlayerProvider} from './src/features/player/PlayerContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AuthProvider>
        <CatalogProvider>
          <PlayerProvider>
            <AppNavigator />
          </PlayerProvider>
        </CatalogProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
