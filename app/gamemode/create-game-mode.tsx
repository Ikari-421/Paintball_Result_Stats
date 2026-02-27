import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NumberInput } from "../../components/common/NumberInput";
import { PrimaryButton } from "../../components/common/PrimaryButton";
import { ScreenHeader } from "../../components/common/ScreenHeader";
import { BorderRadius, Colors, Shadows, Spacing } from "../../constants/theme";

export default function CreateGameModeScreen() {
  const router = useRouter();
  const { createGameMode, error } = useCoreStore();

  const [name, setName] = useState("");
  const [gameTimeMinutes, setGameTimeMinutes] = useState("10");
  const [breakTimeSeconds, setBreakTimeSeconds] = useState("30");
  const [overtimeMinutes, setOvertimeMinutes] = useState("5");
  const [timeOutsPerTeam, setTimeOutsPerTeam] = useState("2");
  const [raceTo, setRaceTo] = useState("5");

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Game mode name is required");
      return;
    }

    const gameTime = parseInt(gameTimeMinutes);
    const breakTime = parseInt(breakTimeSeconds);
    const overtime = parseInt(overtimeMinutes);
    const timeouts = parseInt(timeOutsPerTeam);
    const scoreLimit = parseInt(raceTo);

    if (isNaN(gameTime) || gameTime <= 0) {
      Alert.alert("Error", "Game time must be a positive number");
      return;
    }

    if (isNaN(breakTime) || breakTime < 0) {
      Alert.alert("Error", "Break time must be a positive number or zero");
      return;
    }

    if (isNaN(timeouts) || timeouts < 0) {
      Alert.alert("Error", "Timeouts must be a positive number or zero");
      return;
    }

    if (isNaN(scoreLimit) || scoreLimit <= 0) {
      Alert.alert("Error", "Score limit must be a positive number");
      return;
    }

    try {
      await createGameMode({
        name: name.trim(),
        gameTimeMinutes: gameTime,
        breakTimeSeconds: breakTime,
        timeOutsPerTeam: timeouts,
        raceTo: scoreLimit,
        overtimeMinutes:
          !isNaN(overtime) && overtime > 0 ? overtime : undefined,
      });
      router.back();
    } catch (err) {
      Alert.alert("Error", error || "Unable to create game mode");
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Game Mod Setup" onBack={() => router.back()} />

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Mod Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Finals Format"
            placeholderTextColor={Colors.secondary}
            autoFocus
          />

          <View style={styles.parametersGrid}>
            <NumberInput
              label="Game Time"
              sublabel="Duration per round (min)"
              value={gameTimeMinutes}
              onChangeText={setGameTimeMinutes}
              placeholder="10"
            />

            <NumberInput
              label="Time Out"
              sublabel="Limit per team"
              value={timeOutsPerTeam}
              onChangeText={setTimeOutsPerTeam}
              placeholder="5"
            />

            <NumberInput
              label="Break Time"
              sublabel="Time between rounds (sec)"
              value={breakTimeSeconds}
              onChangeText={setBreakTimeSeconds}
              placeholder="30"
            />

            <NumberInput
              label="Overtime"
              sublabel="Duration of overtime (min)"
              value={overtimeMinutes}
              onChangeText={setOvertimeMinutes}
              placeholder="5"
            />

            <NumberInput
              label="Race To"
              sublabel="Points to win the match"
              value={raceTo}
              onChangeText={setRaceTo}
              placeholder="5"
              isHighlighted
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Create Game Mod"
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
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
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  parametersGrid: {
    gap: 0,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
