import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, usePathname, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect } from "react";
import { useAuth } from "../src/redux/hooks";
import { loadUserAsync } from "../src/redux/slices/authSlice";
import { useAppDispatch } from "../src/redux/hooks";
import { ReduxProvider } from "../src/redux/Provider";
import SessionMonitor from "../components/SessionMonitor";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { currentUser, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadUserAsync() as any);
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !currentUser) {
        // Only redirect to login if not already on an auth screen
        if (!pathname.includes("/(auth)/")) {
          router.replace("/(auth)/login");
        }
      } else {
        // Check if user has any stores
        const hasStores = currentUser.stores && currentUser.stores.length > 0;

        if (!hasStores) {
          // User has no stores - redirect to create store page
          if (!pathname.includes("/(tabs)/setup/store-application")) {
            router.replace("/(tabs)/setup/store-application");
          }
          return;
        }

        // User has stores - check if any store is approved
        const hasApprovedStore =
          currentUser.stores?.some(
            (store) => store.verificationStatus === "approved"
          ) || false;

        if (hasApprovedStore) {
          // User has approved store - allow access to main app (no redirect)
          return;
        } else {
          // User has stores but none approved - show pending approval screen
          if (!pathname.includes("/(tabs)/setup/pending-approval")) {
            router.replace("/(tabs)/setup/pending-approval");
          }
        }
      }
    }
  }, [currentUser, isLoading, isAuthenticated]); // Removed loadUser from dependency array as it's not from useAuth

  if (isLoading) {
    return null; // Render nothing while loading
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SessionMonitor 
        onSessionExpired={() => {
          if (!pathname.includes("/(auth)/")) {
            router.replace("/(auth)/login");
          }
        }}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider>
      <RootLayoutNav />
    </ReduxProvider>
  );
}
