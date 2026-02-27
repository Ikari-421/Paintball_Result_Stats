import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { MatchupList } from "@/components/field/MatchupList";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { Matchup } from "@/src/core/domain/Field";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface MatchupWithDetails extends Matchup {
  teamAName?: string;
  teamBName?: string;
  gameModeId?: string;
  gameModeName?: string;
}

export default function CreateFieldScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    matchup?: string;
    teamAName?: string;
    teamBName?: string;
    gameModeId?: string;
    gameModeName?: string;
  }>();
  const { createField, teams, loadTeams, error } = useCoreStore();
  const [name, setName] = useState("");
  const [matchups, setMatchups] = useState<MatchupWithDetails[]>([]);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (params.matchup) {
      try {
        const matchup = JSON.parse(params.matchup) as Matchup;
        const matchupWithDetails: MatchupWithDetails = {
          ...matchup,
          teamAName: params.teamAName,
          teamBName: params.teamBName,
          gameModeId: params.gameModeId,
          gameModeName: params.gameModeName,
          order: matchups.length + 1,
        };
        setMatchups([...matchups, matchupWithDetails]);
      } catch (err) {
        console.error("Error parsing matchup:", err);
      }
    }
  }, [params.matchup]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Field name is required");
      return;
    }

    try {
      const fieldId = `field-${Date.now()}`;
      await createField(name.trim());
      router.back();
    } catch (err) {
      Alert.alert("Error", error || "Unable to create field");
    }
  };

  const handleAddMatchup = () => {
    router.push("/create-matchup");
  };

  const handleDeleteMatchup = (matchupId: string) => {
    setMatchups(matchups.filter((m) => m.id !== matchupId));
  };

  const handleModSetup = () => {
    router.push("/game-mods");
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Create Field" onBack={() => router.back()} />

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Field Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Main Arena"
          placeholderTextColor={Colors.secondary}
          autoFocus
        />

        <View style={styles.matchupsHeader}>
          <Text style={styles.matchupsTitle}>MatchUps</Text>
          <Text style={styles.matchupsCount}>{matchups.length} Scheduled</Text>
        </View>

        <MatchupList
          matchups={matchups}
          teams={teams}
          onDelete={handleDeleteMatchup}
        />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.actionButtons}>
          <OutlineButton
            title="+ MatchUp"
            onPress={handleAddMatchup}
            style={styles.actionButton}
          />
          <SecondaryButton
            title="Mod Setup"
            onPress={handleModSetup}
            style={styles.actionButton}
          />
        </View>
        <PrimaryButton
          title="Create Field"
          onPress={handleSubmit}
          disabled={!name.trim()}
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: Spacing.xl,
  },
  matchupsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  matchupsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  matchupsCount: {
    fontSize: 13,
    color: Colors.secondary,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
