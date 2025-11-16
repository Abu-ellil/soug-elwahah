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
import { useAuth } from "../contexts/AuthContext";
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
        // Optionally redirect to tabs if on auth screen while logged in
        // This is optional and depends on the specific requirements
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
  return <RootLayoutNav />;
}
