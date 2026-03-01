import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { initDb } from "@/src/infrastructure/database";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { MatchupCreationProvider } from "../contexts/MatchupCreationContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDbReady, setIsDbReady] = useState(false);
  const { loadTeams, loadFields, loadGameModes, loadGames } = useCoreStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        initDb();

        // Load all data from database
        await Promise.all([
          loadTeams(),
          loadFields(),
          loadGameModes(),
          loadGames(),
        ]);

        setIsDbReady(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    initializeApp();
  }, []);

  if (!isDbReady) {
    return null; // Or a loading screen
  }

  return (
    <MatchupCreationProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="menu" />

          {/* Folders auto-routed by Expo Router do not need explicit Stack.Screens here unless they have an _layout.tsx or index.tsx */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </MatchupCreationProvider>
  );
}
