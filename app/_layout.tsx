import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";

import { HeroUINativeProvider } from "heroui-native";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { StravaProvider } from "@/contexts/strava-context";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";

import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const { isDark, colors } = useTheme();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    );
  }

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
          <AuthProvider>
            <StravaProvider>
              <BottomSheetModalProvider>
                <RootLayoutNav />
              </BottomSheetModalProvider>
            </StravaProvider>
          </AuthProvider>
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
