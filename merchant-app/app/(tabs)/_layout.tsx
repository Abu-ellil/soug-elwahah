import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function TabLayout() {
  const { logout, currentUser } = useAuth();
  const hasStores = currentUser?.stores && currentUser.stores.length > 0;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: hasStores ? {
          backgroundColor: 'white',
        } : { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'المنتجات',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'الملف الشخصي',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="store-application"
        options={{
          title: 'طلب إنشاء متجر',
          tabBarButton: () => null, // This hides the tab from the bottom tab bar
          headerShown: false,
        }}
      />
        
    </Tabs>
  );
}
