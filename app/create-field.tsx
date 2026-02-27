import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateFieldScreen() {
  const router = useRouter();
  const { createField, error } = useCoreStore();
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom du terrain est requis");
      return;
    }

    try {
      await createField(name.trim());
      router.back();
    } catch (err) {
      Alert.alert("Erreur", error || "Impossible de créer le terrain");
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
        <Text style={styles.title}>Nouveau Terrain</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Nom du terrain</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Court Central"
            placeholderTextColor="#95cbbc"
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !name.trim() && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!name.trim()}
        >
          <Text style={styles.submitButtonText}>Créer le terrain</Text>
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
