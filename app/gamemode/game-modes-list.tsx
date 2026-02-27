import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { GameModeCard } from "@/components/gamemode/GameModeCard";
import { Colors, Spacing } from "@/constants/theme";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

export default function GameModsListScreen() {
  const router = useRouter();
  const { gameModes, deleteGameMode } = useCoreStore();

  const handleEdit = (id: string) => {
    router.push(`/gameMode/edit-game-mode?id=${id}`);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Game Mode",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteGameMode(id),
        },
      ],
    );
  };

  const handleUseDefault = () => {
    Alert.alert(
      "Use Default Mod",
      "This will use the field's default game mode.",
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="List of Game Modes"
        onBack={() => router.push("/menu")}
      />

      <ScrollView style={styles.content}>
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
              onEdit={() => handleEdit(mode.id)}
              onDelete={() => handleDelete(mode.id, mode.name)}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <SecondaryButton
          title="+ Create Game Mod"
          onPress={() => router.push("/gamemode/create-game-mode")}
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
