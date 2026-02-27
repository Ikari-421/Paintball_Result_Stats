import { AppButton } from "@/components/common/AppButton";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { MatchItem } from "@/components/match/MatchItem";
import { ThemedText } from "@/components/themed-text";
import { AppSpacing } from "@/constants/AppSpacing";
import { Match } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";

const MOCK_MATCHES: Match[] = [
  {
    id: "1",
    fieldId: "1",
    teamA: { id: "1", name: "Team A" },
    teamB: { id: "2", name: "Team B" },
    round: 1,
  },
  {
    id: "2",
    fieldId: "1",
    teamA: { id: "3", name: "Team C" },
    teamB: { id: "4", name: "Team D" },
    round: 2,
  },
  {
    id: "3",
    fieldId: "1",
    teamA: { id: "5", name: "Team E" },
    teamB: { id: "6", name: "Team F" },
    round: 3,
  },
];

export default function FieldScreen() {
  const { id } = useLocalSearchParams();

  const handleStartGame = () => {
    router.push("/game");
  };

  const handleFieldStats = () => {
    console.log("Field Stats");
  };

  const handleMatchSettings = (matchId: string) => {
    console.log("Match settings:", matchId);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Field" />

      <ThemedText type="subtitle" style={styles.fieldName}>
        Field Name
      </ThemedText>

      <FlatList
        data={MOCK_MATCHES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchItem
            match={item}
            onSettingsPress={() => handleMatchSettings(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <AppButton
          title="Start Games"
          onPress={handleStartGame}
          variant="accent"
        />
        <AppButton
          title="Field Stats"
          onPress={handleFieldStats}
          variant="danger"
          style={styles.statsButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fieldName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: AppSpacing.xxl,
  },
  listContainer: {
    paddingHorizontal: AppSpacing.xl,
    gap: AppSpacing.lg,
  },
  footer: {
    paddingHorizontal: AppSpacing.xl,
    paddingVertical: AppSpacing.xl,
    gap: AppSpacing.md,
  },
  statsButton: {
    paddingVertical: 12,
  },
});
