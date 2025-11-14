import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useCart } from '../context/CartContext';
import HomeScreen from '../screens/Home/HomeScreen';
import StoreDetailsScreen from '../screens/Home/StoreDetailsScreen';
import COLORS from '../constants/colors';
import SIZES from '../constants/sizes';

// Placeholder screens - will be replaced with actual screens
const CategoriesScreen = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text>Categories Screen</Text>
  </View>
);
const CartScreen = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text>Cart Screen</Text>
  </View>
);
const OrdersScreen = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text>Orders Screen</Text>
  </View>
);
const ProfileScreen = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text>Profile Screen</Text>
  </View>
);

// Home Stack Navigator
const HomeStack = createNativeStackNavigator();
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false, statusBarStyle: 'dark' }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="StoreDetails" component={StoreDetailsScreen} />
  </HomeStack.Navigator>
);

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { getCartItemsCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: SIZES.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: 'white',
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'الرئيسية',
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'الفئات',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'السلة',
          tabBarBadge: getCartItemsCount() > 0 ? getCartItemsCount() : null,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.danger,
            color: 'white',
            fontSize: 12,
          },
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'الطلبات',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'الحساب',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
