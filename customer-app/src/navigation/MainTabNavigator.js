import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Animated } from 'react-native';
import { useCart } from '../context/CartContext';
import HomeScreen2 from '../screens/Home/HomeScreen';
import StoreDetailsScreen2 from '../screens/Home/StoreDetailsScreen';
import CategoryStoresScreen from '../screens/Categories/CategoryStoresScreen';
import CategoriesScreen from '../screens/Categories/CategoriesScreen';
import CartScreen from '../screens/Cart/CartScreen';
import OrdersScreen from '../screens/Orders/OrdersScreen';
import OrderDetailsScreen from '../screens/Orders/OrderDetailsScreen';
import COLORS from '../constants/colors';
import SIZES from '../constants/sizes';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import AddressesScreen from '../screens/Profile/AddressesScreen';
import AddAddressScreen from '../screens/Profile/AddAddressScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';

// Placeholder screens - will be replaced with actual screens

// Home Stack Navigator
const HomeStack = createNativeStackNavigator();
const HomeStackNavigator = () => (
  <HomeStack.Navigator
    screenOptions={{ headerShown: false, statusBarStyle: 'dark', animation: 'slide_from_right' }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen2} />
    <HomeStack.Screen name="StoreDetails" component={StoreDetailsScreen2} />
    <HomeStack.Screen name="CategoryStores" component={CategoryStoresScreen} />
    <HomeStack.Screen name="Checkout" component={CheckoutScreen} />
  </HomeStack.Navigator>
);


// Order Stack Navigator
const OrderStack = createNativeStackNavigator();
const OrderStackNavigator = () => (
  <OrderStack.Navigator
    screenOptions={{ headerShown: false, statusBarStyle: 'dark', animation: 'slide_from_right' }}>
    <OrderStack.Screen name="OrdersList" component={OrdersScreen} />
    <OrderStack.Screen name="OrderDetails" component={OrderDetailsScreen} />
  </OrderStack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = createNativeStackNavigator();
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator
    screenOptions={{ headerShown: false, statusBarStyle: 'dark', animation: 'slide_from_right' }}>
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="Addresses" component={AddressesScreen} />
    <ProfileStack.Screen name="AddAddress" component={AddAddressScreen} />
  </ProfileStack.Navigator>
);

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (cartCount > 0) {
      bounceAnim.setValue(1.2);
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 2,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [cartCount, bounceAnim]);

  const animatedBadgeStyle = {
    transform: [{ scale: bounceAnim }],
    backgroundColor: COLORS.danger,
    color: 'white',
    fontSize: 12,
  };

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
          tabBarBadge: cartCount > 0 ? cartCount : null,
          tabBarBadgeStyle: animatedBadgeStyle,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderStackNavigator}
        options={{
          tabBarLabel: 'الطلبات',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'الحساب',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
