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
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

export default function EditTeamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { teams, updateTeam, error } = useCoreStore();
  const [name, setName] = useState("");
  const [isGuest, setIsGuest] = useState(false);

  const team = teams.find((t) => t.id === id);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setIsGuest(team.isGuest || false);
    }
  }, [team]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Team name is required");
      return;
    }

    if (!team) {
      Alert.alert("Error", "Team not found");
      return;
    }

    try {
      await updateTeam(team.id, name.trim(), isGuest);
      router.back();
    } catch (err) {
      Alert.alert("Error", error || "Unable to update team");
    }
  };

  if (!team) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Edit Team" onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Team not found</Text>
          <PrimaryButton title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Edit Team" onBack={() => router.back()} />

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Team Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Team Alpha"
            placeholderTextColor={Colors.secondary}
            autoFocus
          />

          <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Guest Team</Text>
              <Text style={styles.switchSubtext}>
                Guest teams are not saved permanently
              </Text>
            </View>
            <Switch
              value={isGuest}
              onValueChange={setIsGuest}
              trackColor={{ false: Colors.secondary, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Update Team"
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
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 16,
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
    marginBottom: Spacing.xl,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
