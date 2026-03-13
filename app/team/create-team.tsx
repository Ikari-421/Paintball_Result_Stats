import { Spacing } from "@/constants/theme";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateTeamScreen() {
  const router = useRouter();
  const { createTeam, error } = useCoreStore();
  const [name, setName] = useState("");
  const [isGuest, setIsGuest] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Team name is required");
      return;
    }

    try {
      await createTeam(name.trim(), isGuest);
      router.back();
    } catch {
      Alert.alert("Error", error || "Unable to create team");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Team</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Team Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Team Alpha"
            placeholderTextColor="#95cbbc"
            autoFocus
          />

          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.switchLabel}>Guest Team</Text>
              <Text style={styles.switchSubtext}>
                Guest teams are not saved permanently
              </Text>
            </View>
            <Switch
              value={isGuest}
              onValueChange={setIsGuest}
              trackColor={{ false: "#95cbbc", true: "#5FC2BA" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !name.trim() && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!name.trim()}
        >
          <Text style={styles.submitButtonText}>Create Team</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBF2FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#2c4b5c",
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#152b42",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#EBF2FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#152b42",
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#152b42",
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 12,
    color: "#2c4b5c",
    maxWidth: 250,
  },
  submitButton: {
    backgroundColor: "#2c4b5c",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#95cbbc",
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
