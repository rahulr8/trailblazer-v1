import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";

import { onAuthStateChanged, User } from "firebase/auth";

import { HeroUINativeProvider } from "heroui-native";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { ThemeProvider, useTheme } from "@/contexts/theme-context";
import { auth } from "@/lib/firebase";

import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const { isDark, colors } = useTheme();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    console.log("[Layout] Setting up auth listener");
    return onAuthStateChanged(auth, (user) => {
      console.log("[Layout] Auth state changed:", user ? user.uid : "null");
      setUser(user);
    });
  }, []);

  // Loading state while checking auth
  if (user === undefined) {
    console.log("[Layout] Rendering: Loading...");
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not authenticated - show login only
  if (user === null) {
    console.log("[Layout] Rendering: Login screen (not authenticated)");
    return (
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    );
  }

  // Authenticated - show main app
  console.log("[Layout] Rendering: Main app (authenticated as", user.uid, ")");
  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: "transparentModal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <HeroUINativeProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <RootLayoutNav />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
