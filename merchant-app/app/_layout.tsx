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
import { useAuth, AuthProvider } from "../contexts/AuthContext";
import { useEffect } from "react";
import { router } from "expo-router";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.replace("/(auth)/login");
      } else {
        // Check if store owner is pending approval
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
  }, [currentUser, isLoading]);

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
