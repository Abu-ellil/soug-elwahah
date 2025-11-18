import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect } from "react";
import { router, usePathname } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext"; // Import AuthProvider and useAuth

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { currentUser, isLoading } = useAuth(); // Use useAuth from AuthContext
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        // Only redirect to login if not already on an auth screen
        if (!pathname.includes('/(auth)/')) {
          router.replace("/(auth)/login");
        }
      } else {
        // Check if user has any stores
        const hasStores = currentUser.stores && currentUser.stores.length > 0;

        if (!hasStores) {
          // User has no stores - redirect to onboarding/welcome screen
          if (!pathname.includes('/(tabs)/welcome')) {
            router.replace("/(tabs)/welcome");
          }
          return;
        }

        // User has stores - check verification status
        if (currentUser.verificationStatus === 'pending') {
          router.replace("/(tabs)/pending-approval");
        } else if (currentUser.verificationStatus === 'rejected') {
          // If rejected, user might need to contact admin or update information
          // For now, we can still show the pending approval screen with rejection message
          router.replace("/(tabs)/pending-approval");
        } else {
          // If approved, ensure user is on main tabs
          // This is optional and depends on the specific requirements
        }
      }
    }
  }, [currentUser, isLoading]); // Removed loadUser from dependency array as it's not from useAuth

  if (isLoading) {
    return null; // Render nothing while loading
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
