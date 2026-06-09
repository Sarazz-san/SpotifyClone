import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BottomMiniPlayer} from '../components/BottomMiniPlayer';
import {colors} from '../constants/colors';
import {useAuth} from '../features/auth/AuthContext';
import {PlayerScreen} from '../features/player/PlayerScreen';
import {PlaylistDetailScreen} from '../features/catalog/PlaylistDetailScreen';
import {RecentsScreen} from '../features/home/RecentsScreen';
import {ArtistPickerScreen} from '../features/library/ArtistPickerScreen';
import {LikedSongsScreen} from '../features/library/LikedSongsScreen';
import {AuthNavigator} from './AuthNavigator';
import {MainTabs} from './MainTabs';
import type {RootStackParamList} from './navigationTypes';

import {useNavigationContainerRef} from '@react-navigation/native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    primary: colors.primary,
    text: colors.text,
    border: colors.surface,
  },
};

export function AppNavigator() {
  const {user, isInitializing} = useAuth();
  const navigationRef = useNavigationContainerRef();
  const [routeName, setRouteName] = React.useState<string | undefined>();

  const onReady = () => {
    setRouteName((navigationRef.getCurrentRoute() as any)?.name);
  };

  if (isInitializing) {
    return (
      <View style={{flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      onReady={onReady}
      onStateChange={() => {
        setRouteName((navigationRef.getCurrentRoute() as any)?.name);
      }}
      theme={navigationTheme}
    >
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Player"
              component={PlayerScreen}
              options={{animation: 'slide_from_bottom'}}
            />
            <Stack.Screen name="Recents" component={RecentsScreen} />
            <Stack.Screen name="ArtistPicker" component={ArtistPickerScreen} />
            <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
            <Stack.Screen name="LikedSongs" component={LikedSongsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
      {user && routeName !== 'Player' ? <BottomMiniPlayer /> : null}
    </NavigationContainer>
  );
}
