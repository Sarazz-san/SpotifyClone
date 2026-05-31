import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {colors} from '../constants/colors';
import {typography} from '../constants/typography';
import {AdminScreen} from '../features/admin/AdminScreen';
import {useAuth} from '../features/auth/AuthContext';
import {CreateScreen} from '../features/create/CreateScreen';
import {HomeScreen} from '../features/home/HomeScreen';
import {LibraryScreen} from '../features/library/LibraryScreen';
import {PremiumScreen} from '../features/premium/PremiumScreen';
import {SearchScreen} from '../features/search/SearchScreen';
import type {MainTabParamList} from './navigationTypes';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({focused, name}: {focused: boolean; name: string}) {
  return (
    <View style={styles.tabIconContainer}>
      <Icon
        color={focused ? colors.primary : colors.textMuted}
        name={name}
        size={24}
      />
    </View>
  );
}

function HomeTabIcon({focused}: {focused: boolean}) {
  return <TabIcon focused={focused} name="home" />;
}

function SearchTabIcon({focused}: {focused: boolean}) {
  return <TabIcon focused={focused} name="magnify" />;
}

function LibraryTabIcon({focused}: {focused: boolean}) {
  return <TabIcon focused={focused} name="library-shelves" />;
}

function PremiumTabIcon({focused}: {focused: boolean}) {
  return <TabIcon focused={focused} name="spotify" />;
}

function CreateTabIcon({focused}: {focused: boolean}) {
  return <TabIcon focused={focused} name="plus" />;
}

function AdminTabIcon({focused}: {focused: boolean}) {
  return <TabIcon focused={focused} name="shield-check" />;
}

export function MainTabs() {
  const {user} = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: 'rgba(0,0,0,0.96)',
          borderTopColor: 'rgba(255,255,255,0.06)',
        },
        tabBarLabelStyle: {
          fontSize: typography.label,
          fontWeight: '800',
        },
        tabBarShowLabel: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarIcon: HomeTabIcon}}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: SearchTabIcon,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          title: 'Your Library',
          tabBarIcon: LibraryTabIcon,
        }}
      />
      <Tab.Screen
        name="Premium"
        component={PremiumScreen}
        options={{tabBarIcon: PremiumTabIcon}}
      />
      {user?.isAdmin ? (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            title: 'Admin',
            tabBarIcon: AdminTabIcon,
          }}
        />
      ) : (
        <Tab.Screen
          name="Create"
          component={CreateScreen}
          options={{tabBarIcon: CreateTabIcon}}
        />
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
