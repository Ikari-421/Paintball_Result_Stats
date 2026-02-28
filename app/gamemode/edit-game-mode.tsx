import { NumberInput } from "@/components/common/NumberInput";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
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

export default function EditGameModeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gameModes, updateGameMode, error } = useCoreStore();

  const [name, setName] = useState("");
  const [gameTimeMinutes, setGameTimeMinutes] = useState("10");
  const [breakTimeSeconds, setBreakTimeSeconds] = useState("30");
  const [overtimeMinutes, setOvertimeMinutes] = useState("5");
  const [timeOutsPerTeam, setTimeOutsPerTeam] = useState("2");
  const [raceTo, setRaceTo] = useState("5");

  const gameMode = gameModes.find((gm) => gm.id === id);

  useEffect(() => {
    if (gameMode) {
      setName(gameMode.name);
      setGameTimeMinutes(gameMode.gameTime.minutes.toString());
      setBreakTimeSeconds(gameMode.breakTime.seconds.toString());
      setOvertimeMinutes(gameMode.overTime?.minutes.toString() || "5");
      setTimeOutsPerTeam(gameMode.timeOutsPerTeam.quantity.toString());
      setRaceTo(gameMode.raceTo.value.toString());
    }
  }, [gameMode]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Game mode name is required");
      return;
    }

    if (!gameMode) {
      Alert.alert("Error", "Game mode not found");
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
      await updateGameMode({
        id: gameMode.id,
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
      Alert.alert("Error", error || "Unable to update game mode");
    }
  };

  if (!gameMode) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Edit Game Mod" onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Game mode not found</Text>
          <PrimaryButton title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Edit Game Mod" onBack={() => router.back()} />

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Mod Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Tournament Mode"
            placeholderTextColor={Colors.secondary}
            autoFocus
          />
        </View>

        <View style={styles.card}>
          <NumberInput
            label="Game Time"
            sublabel="Duration of each game in minutes"
            value={gameTimeMinutes}
            onChangeText={setGameTimeMinutes}
            placeholder="10"
          />
          <NumberInput
            label="Time Out"
            sublabel="Number of timeouts per team"
            value={timeOutsPerTeam}
            onChangeText={setTimeOutsPerTeam}
            placeholder="2"
          />
          <NumberInput
            label="Break Time"
            sublabel="Duration between games in seconds"
            value={breakTimeSeconds}
            onChangeText={setBreakTimeSeconds}
            placeholder="30"
          />
          <NumberInput
            label="Overtime"
            sublabel="Duration of overtime in minutes"
            value={overtimeMinutes}
            onChangeText={setOvertimeMinutes}
            placeholder="5"
          />
          <NumberInput
            label="Race To"
            sublabel="First team to reach this score wins"
            value={raceTo}
            onChangeText={setRaceTo}
            placeholder="5"
            isHighlighted
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Update Game Mod"
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
