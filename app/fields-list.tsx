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

export default function FieldsListScreen() {
  const router = useRouter();
  const { fields, deleteField } = useCoreStore();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Supprimer le terrain",
      `Voulez-vous vraiment supprimer "${name}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteField(id),
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
        <Text style={styles.title}>Terrains</Text>
        <TouchableOpacity
          onPress={() => router.push("/create-field")}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {fields.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucun terrain</Text>
          <Text style={styles.emptySubtext}>
            Créez votre premier terrain pour commencer
          </Text>
        </View>
      ) : (
        <FlatList
          data={fields}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.fieldCard}
              onPress={() => router.push(`/field/${item.id}`)}
            >
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldName}>{item.name}</Text>
                <Text style={styles.matchupCount}>
                  {item.matchups.length} confrontation
                  {item.matchups.length > 1 ? "s" : ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id, item.name);
                }}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
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
  fieldCard: {
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
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#152b42",
    marginBottom: 4,
  },
  matchupCount: {
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
