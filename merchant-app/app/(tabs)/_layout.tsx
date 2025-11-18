import { Tabs, Redirect, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function TabLayout() {
  const { logout, currentUser } = useAuth();
  const hasStores = currentUser?.stores && currentUser.stores.length > 0;
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    if (!hasStores && (pathname === '/products' || pathname === '/profile')) {
      router.push('/'); // Attempting to redirect to the root
    }
  }, [hasStores, pathname, router]);

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
      {hasStores && (
        <>
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
        </>
      )}
    </Tabs>
  );
}
