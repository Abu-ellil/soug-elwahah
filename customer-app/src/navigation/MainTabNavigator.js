import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Animated } from 'react-native';
import { useCart } from '../context/CartContext';
import HomeScreen from '../screens/Home/HomeScreen';
import StoreDetailsScreen from '../screens/Home/StoreDetailsScreen';
import HomeScreen2 from '../screens/Home2/HomeScreen2';
import CategoryStoresScreen from '../screens/Categories/CategoryStoresScreen';
import CartScreen from '../screens/Cart/CartScreen';
import OrdersScreen from '../screens/Orders/OrdersScreen';
import OrderDetailsScreen from '../screens/Orders/OrderDetailsScreen';
import COLORS from '../constants/colors';
import SIZES from '../constants/sizes';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import AddressesScreen from '../screens/Profile/AddressesScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';

// Placeholder screens - will be replaced with actual screens
const CategoriesScreen = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text>Categories Screen</Text>
  </View>
); 

// Home Stack Navigator
const HomeStack = createNativeStackNavigator();
const HomeStackNavigator = () => (
  <HomeStack.Navigator
    screenOptions={{ headerShown: false, statusBarStyle: 'dark', animation: 'slide_from_right' }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="StoreDetails" component={StoreDetailsScreen} />
    <HomeStack.Screen name="CategoryStores" component={CategoryStoresScreen} />
    <HomeStack.Screen name="Checkout" component={CheckoutScreen} />
  </HomeStack.Navigator>
);

// Home2 Stack Navigator
const Home2Stack = createNativeStackNavigator();
const Home2StackNavigator = () => (
  <Home2Stack.Navigator
    screenOptions={{ headerShown: false, statusBarStyle: 'dark', animation: 'slide_from_right' }}>
    <Home2Stack.Screen name="Home2Main" component={HomeScreen2} />
    <Home2Stack.Screen name="StoreDetails" component={StoreDetailsScreen} />
    <Home2Stack.Screen name="CategoryStores" component={CategoryStoresScreen} />
    <Home2Stack.Screen name="Checkout" component={CheckoutScreen} />
  </Home2Stack.Navigator>
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
          } else if (route.name === 'Home2') {
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
        name="Home2"
        component={Home2StackNavigator}
        options={{
          tabBarLabel: 'الرئيسية 2',
          tabBarIcon: ({ focused, color, size }) => {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          },
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
