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
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="menu" options={{ headerShown: false }} />

          {/* Team Management */}
          <Stack.Screen name="teams-list" options={{ headerShown: false }} />
          <Stack.Screen name="create-team" options={{ headerShown: false }} />
          <Stack.Screen name="edit-team" options={{ headerShown: false }} />

          {/* Matchup Creation */}
          <Stack.Screen
            name="create-matchup"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="select-team" options={{ headerShown: false }} />
          <Stack.Screen
            name="select-game-mode"
            options={{ headerShown: false }}
          />

          {/* Field Management */}
          <Stack.Screen name="fields-list" options={{ headerShown: false }} />
          <Stack.Screen name="create-field" options={{ headerShown: false }} />
          <Stack.Screen name="edit-field" options={{ headerShown: false }} />
          <Stack.Screen name="field/[id]" options={{ headerShown: false }} />

          {/* Game Mode Management */}
          <Stack.Screen name="game-mods" options={{ headerShown: false }} />
          <Stack.Screen
            name="create-game-mode"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="edit-game-mode"
            options={{ headerShown: false }}
          />

          {/* Game Session */}
          <Stack.Screen name="game" options={{ headerShown: false }} />
          <Stack.Screen name="start-match" options={{ headerShown: false }} />
          <Stack.Screen
            name="match/[gameId]"
            options={{ headerShown: false }}
          />

          {/* Other */}
          <Stack.Screen name="history" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
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
