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

          {/* Field Management */}
          <Stack.Screen name="field" />

          {/* Team Management */}
          <Stack.Screen name="team" />

          {/* Game Mode Management */}
          <Stack.Screen name="gamemode" />

          {/* Game Session */}
          <Stack.Screen name="start-match" />
          <Stack.Screen name="match" />

          {/* Other */}
          <Stack.Screen name="history" />
          <Stack.Screen name="profile" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </MatchupCreationProvider>
  );
}
