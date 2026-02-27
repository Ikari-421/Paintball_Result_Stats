import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
      Alert.alert("Erreur", "Le nom du mode de jeu est requis");
      return;
    }

    const gameTime = parseInt(gameTimeMinutes);
    const breakTime = parseInt(breakTimeSeconds);
    const overtime = parseInt(overtimeMinutes);
    const timeouts = parseInt(timeOutsPerTeam);
    const scoreLimit = parseInt(raceTo);

    if (isNaN(gameTime) || gameTime <= 0) {
      Alert.alert("Erreur", "La durée du jeu doit être un nombre positif");
      return;
    }

    if (isNaN(breakTime) || breakTime < 0) {
      Alert.alert(
        "Erreur",
        "La durée du break doit être un nombre positif ou zéro",
      );
      return;
    }

    if (isNaN(timeouts) || timeouts < 0) {
      Alert.alert(
        "Erreur",
        "Le nombre de timeouts doit être un nombre positif ou zéro",
      );
      return;
    }

    if (isNaN(scoreLimit) || scoreLimit <= 0) {
      Alert.alert("Erreur", "La limite de score doit être un nombre positif");
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
      Alert.alert("Erreur", error || "Impossible de créer le mode de jeu");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nouveau Mode</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Nom du mode</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Tournoi Rapide"
            placeholderTextColor="#95cbbc"
            autoFocus
          />
        </View>

        <View style={styles.card}>
          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Durée du jeu</Text>
              <Text style={styles.sublabel}>Minutes</Text>
            </View>
            <TextInput
              style={styles.numberInput}
              value={gameTimeMinutes}
              onChangeText={setGameTimeMinutes}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor="#95cbbc"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Temps de pause</Text>
              <Text style={styles.sublabel}>Secondes entre rounds</Text>
            </View>
            <TextInput
              style={styles.numberInput}
              value={breakTimeSeconds}
              onChangeText={setBreakTimeSeconds}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor="#95cbbc"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Overtime</Text>
              <Text style={styles.sublabel}>Durée en minutes (optionnel)</Text>
            </View>
            <TextInput
              style={styles.numberInput}
              value={overtimeMinutes}
              onChangeText={setOvertimeMinutes}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor="#95cbbc"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Timeouts</Text>
              <Text style={styles.sublabel}>Par équipe</Text>
            </View>
            <TextInput
              style={styles.numberInput}
              value={timeOutsPerTeam}
              onChangeText={setTimeOutsPerTeam}
              keyboardType="numeric"
              placeholder="2"
              placeholderTextColor="#95cbbc"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Race To</Text>
              <Text style={styles.sublabel}>Score limite pour gagner</Text>
            </View>
            <TextInput
              style={styles.numberInput}
              value={raceTo}
              onChangeText={setRaceTo}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor="#95cbbc"
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
          <Text style={styles.submitButtonText}>Créer le mode de jeu</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  },
  sublabel: {
    fontSize: 12,
    color: "#2c4b5c",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#EBF2FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#152b42",
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EBF2FA",
  },
  inputColumn: {
    flex: 1,
  },
  numberInput: {
    backgroundColor: "#EBF2FA",
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#152b42",
    textAlign: "center",
    width: 80,
  },
  submitButton: {
    backgroundColor: "#2c4b5c",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
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
