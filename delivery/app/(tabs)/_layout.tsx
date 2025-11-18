import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ProtectedRoute from '../../src/components/ProtectedRoute';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'الرئيسية',
            tabBarIcon: ({ color, focused }) => (
              focused
                ? <Ionicons name="home" size={28} color={color} />
                : <Ionicons name="home-outline" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'الطلبات',
            tabBarIcon: ({ color, focused }) => (
              focused
                ? <Ionicons name="cube" size={28} color={color} />
                : <Ionicons name="cube-outline" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'السجل',
            tabBarIcon: ({ color, focused }) => (
              focused
                ? <Ionicons name="time" size={28} color={color} />
                : <Ionicons name="time-outline" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'الملف الشخصي',
            tabBarIcon: ({ color, focused }) => (
              focused
                ? <Ionicons name="person" size={28} color={color} />
                : <Ionicons name="person-outline" size={28} color={color} />
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
