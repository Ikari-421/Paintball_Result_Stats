import { ScreenContainer } from "@/components/common/ScreenContainer";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { TeamScoreCard } from "@/components/game/TeamScoreCard";
import { TimerDisplay } from "@/components/game/TimerDisplay";
import { ThemedText } from "@/components/themed-text";
import { AppColors } from "@/constants/AppColors";
import { AppSpacing } from "@/constants/AppSpacing";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function GameScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [teamCScore, setTeamCScore] = useState(0);
  const [teamDScore, setTeamDScore] = useState(0);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const incrementScore = (team: "C" | "D") => {
    if (team === "C") {
      setTeamCScore((prev) => prev + 1);
    } else {
      setTeamDScore((prev) => prev + 1);
    }
  };

  const decrementScore = (team: "C" | "D") => {
    if (team === "C") {
      setTeamCScore((prev) => Math.max(0, prev - 1));
    } else {
      setTeamDScore((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Game" />

      <ThemedText type="subtitle" style={styles.subtitle}>
        Game On
      </ThemedText>

      <View style={styles.scoreBoard}>
        <TeamScoreCard
          teamName="Team C"
          score={teamCScore}
          backgroundColor={AppColors.primary}
          onIncrement={() => incrementScore("C")}
          onDecrement={() => decrementScore("C")}
        />
        <TeamScoreCard
          teamName="Team D"
          score={teamDScore}
          backgroundColor={AppColors.danger}
          onIncrement={() => incrementScore("D")}
          onDecrement={() => decrementScore("D")}
        />
      </View>

      <View style={styles.timerSection}>
        <TimerDisplay label="Break time" minutes={0} seconds={30} />
        <TimerDisplay label="Game time" minutes={8} seconds={56} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.startButton]}
          onPress={handleStart}
          disabled={isRunning}
        >
          <ThemedText style={styles.controlButtonText}>START</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.stopButton]}
          onPress={handleStop}
          disabled={!isRunning}
        >
          <ThemedText style={styles.controlButtonText}>STOP</ThemedText>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: AppSpacing.xxl,
  },
  scoreBoard: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: AppSpacing.xl,
    marginBottom: AppSpacing.xxl,
  },
  timerSection: {
    paddingHorizontal: AppSpacing.xxxl,
    gap: AppSpacing.lg,
    marginBottom: AppSpacing.xxl,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: AppSpacing.xl,
    paddingHorizontal: AppSpacing.xxxl,
  },
  controlButton: {
    flex: 1,
    paddingVertical: AppSpacing.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: AppColors.accent,
  },
  stopButton: {
    backgroundColor: AppColors.danger,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.text,
  },
});
