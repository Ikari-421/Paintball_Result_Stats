import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useMatchupCreation } from "@/contexts/MatchupCreationContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function CreateMatchupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    returnTo?: string;
    fieldId?: string;
  }>();
  const { teamA, teamB, gameMode, tempMatchups, addTempMatchup, reset } =
    useMatchupCreation();

  const handleSelectTeamA = () => {
    router.push("/team/select-team?role=teamA");
  };

  const handleSelectTeamB = () => {
    router.push("/team/select-team?role=teamB");
  };

  const handleSelectGameMode = () => {
    router.push("/gamemode/select-game-mode");
  };

  const handleAddMatchup = () => {
    if (!teamA || !teamB) {
      Alert.alert("Error", "Please select both teams");
      return;
    }

    if (teamA.id === teamB.id) {
      Alert.alert("Error", "Team A and Team B must be different");
      return;
    }

    if (!gameMode) {
      Alert.alert("Error", "Please select a game mode");
      return;
    }

    const newMatchup = {
      id: `matchup-${Date.now()}`,
      teamA: teamA.id,
      teamB: teamB.id,
      teamAName: teamA.name,
      teamBName: teamB.name,
      gameModeId: gameMode.id,
      order: tempMatchups.length + 1,
    };

    addTempMatchup(newMatchup);
    reset();
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Create Matchup" onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Team A</Text>
          {teamA ? (
            <View style={styles.selectedTeam}>
              <Text style={styles.selectedTeamName}>{teamA.name}</Text>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.primary}
              />
            </View>
          ) : (
            <PrimaryButton title="Select Team" onPress={handleSelectTeamA} />
          )}
        </View>

        <View style={styles.vsBadge}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Team B</Text>
          {teamB ? (
            <View style={styles.selectedTeam}>
              <Text style={styles.selectedTeamName}>{teamB.name}</Text>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.primary}
              />
            </View>
          ) : (
            <OutlineButton title="Select Team" onPress={handleSelectTeamB} />
          )}
        </View>

        <View style={[styles.card, styles.gameModeCard]}>
          <Text style={styles.cardTitle}>Game Mode</Text>
          {gameMode ? (
            <View style={styles.selectedTeam}>
              <Text style={styles.selectedTeamName}>{gameMode.name}</Text>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.primary}
              />
            </View>
          ) : (
            <OutlineButton title="Select Game Mode" onPress={handleSelectGameMode} />
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Add MatchUp"
          onPress={handleAddMatchup}
          disabled={!teamA || !teamB || !gameMode}
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  selectedTeam: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  selectedTeamName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  vsBadge: {
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  vsText: {
    fontSize: 16,
    fontWeight: "800",
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameModeCard: {
    marginTop: Spacing.xl,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
