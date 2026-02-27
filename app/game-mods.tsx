import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GameModsScreen() {
  const router = useRouter();
  const { gameModes, deleteGameMode } = useCoreStore();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Supprimer le mode de jeu",
      `Voulez-vous vraiment supprimer "${name}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteGameMode(id),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Modes de Jeu</Text>
        <TouchableOpacity
          onPress={() => router.push("/create-game-mode")}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {gameModes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucun mode de jeu</Text>
          <Text style={styles.emptySubtext}>
            Créez votre premier mode de jeu pour commencer
          </Text>
        </View>
      ) : (
        <FlatList
          data={gameModes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.modeCard}>
              <View style={styles.modeInfo}>
                <Text style={styles.modeName}>{item.name}</Text>
                <View style={styles.modeDetails}>
                  <Text style={styles.modeDetail}>
                    ⏱️ {item.gameTime.minutes} min
                  </Text>
                  <Text style={styles.modeDetail}>
                    ⏸️ {item.breakTime.seconds}s
                  </Text>
                  <Text style={styles.modeDetail}>
                    🎯 Race to {item.raceTo.value}
                  </Text>
                  {item.overTime && (
                    <Text style={styles.modeDetail}>
                      ⚡ OT: {item.overTime.minutes}min
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  addButton: {
    backgroundColor: "#5FC2BA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  modeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#152b42",
    marginBottom: 8,
  },
  modeDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  modeDetail: {
    fontSize: 14,
    color: "#2c4b5c",
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#152b42",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#2c4b5c",
    textAlign: "center",
  },
});
