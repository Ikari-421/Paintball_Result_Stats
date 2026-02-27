import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { GameModeCard } from "@/components/gamemode/GameModeCard";
import { Colors, Spacing } from "@/constants/theme";
import { useMatchupCreation } from "@/contexts/MatchupCreationContext";
import { GameMode } from "@/src/core/domain/GameMode";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

export default function SelectGameModeScreen() {
  const router = useRouter();
  const { gameModes, loadGameModes } = useCoreStore();
  const { gameMode, setGameMode } = useMatchupCreation();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  useEffect(() => {
    loadGameModes();
  }, []);

  useEffect(() => {
    if (gameMode) {
      const mode = gameModes.find((m) => m.id === gameMode.id);
      setSelectedMode(mode || null);
    }
  }, [gameMode, gameModes]);

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);
  };

  const handleUseDefault = () => {
    Alert.alert(
      "Use Default Mod",
      "This will use the field's default game mode.",
    );
  };

  const handleContinue = () => {
    if (!selectedMode) {
      Alert.alert("Error", "Please select a game mode");
      return;
    }

    setGameMode({
      id: selectedMode.id,
      name: selectedMode.name,
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Select Mod" onBack={() => router.back()} />

      <ScrollView style={styles.content}>
        <OutlineButton
          title="✓ Use Field's Default Mod"
          onPress={handleUseDefault}
          style={styles.defaultButton}
        />

        <Text style={styles.sectionTitle}>SAVED GAME MODES</Text>

        {gameModes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No game modes yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first game mode to get started
            </Text>
          </View>
        ) : (
          gameModes.map((mode) => (
            <GameModeCard
              key={mode.id}
              gameMode={mode}
              isSelected={selectedMode?.id === mode.id}
              onSelect={() => handleSelectMode(mode)}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <SecondaryButton
          title="+ Create Game Mod"
          onPress={() => router.push("/gamemode/create-game-mode")}
        />
        <PrimaryButton
          title="Select & Continue"
          onPress={handleContinue}
          disabled={!selectedMode}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  defaultButton: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    opacity: 0.8,
    textTransform: "uppercase",
    marginBottom: Spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: "center",
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
});
