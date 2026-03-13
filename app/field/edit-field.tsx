import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { MatchupList } from "@/components/field/MatchupList";
import { FieldNameModal } from "@/components/field/modals/FieldNameModal";
import { Colors, Spacing } from "@/constants/theme";
import { useMatchupCreation } from "@/contexts/MatchupCreationContext";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Removed MatchupWithDetails - using field.matchups directly

export default function EditFieldScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
  }>();
  const { id } = params;
  const {
    fields,
    teams,
    updateField,
    addMatchupToField,
    removeMatchupFromField,
    loadTeams,
    loadFields,
    error,
    reorderMatchupsInField,
    games,
  } = useCoreStore();
  const { tempMatchups, clearTempMatchups } =
    useMatchupCreation();

  const [name, setName] = useState("");
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);

  const field = fields.find((f) => f.id === id);

  useFocusEffect(
    useCallback(() => {
      loadTeams();
      loadFields();
    }, [loadTeams, loadFields])
  );

  useEffect(() => {
    if (field) {
      setName(field.name);
    }
  }, [field]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Field name is required");
      return;
    }

    if (!field) {
      Alert.alert("Error", "Field not found");
      return;
    }

    try {
      // Commit the name change of the field
      await updateField(field.id, name.trim());

      router.push(`/field/${field.id}`);
    } catch {
      Alert.alert("Error", error || "Unable to update field");
    }
  };

  const handleAddMatchup = async () => {
    if (!field) return;

    router.push(
      `/field/matchup/create-matchup?returnTo=/field/edit-field&fieldId=${id}`,
    );
  };

  const handleEditMatchup = (matchupId: string) => {
    if (!field) return;
    router.push(
      `/field/matchup/edit-matchup?fieldId=${id}&matchupId=${matchupId}`
    );
  };

  const handleDeleteMatchup = async (matchupId: string) => {
    if (!field) return;

    try {
      await removeMatchupFromField(field.id, matchupId);
    } catch {
      Alert.alert("Error", "Unable to delete matchup");
    }
  };

  const handleDragEnd = async (newOrder: any[]) => {
    if (!field) return;

    try {
      // Create a list of matchup IDs in the new order
      const newOrderIds = newOrder.map((m) => m.id);
      await reorderMatchupsInField(field.id, newOrderIds);
    } catch (error) {
      console.error("Failed to reorder matchups:", error);
      Alert.alert("Error", "Unable to save new order");
    }
  };

  if (!field) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Edit Field" onBack={() => {
          clearTempMatchups();
          router.back()
        }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Field not found</Text>
          <PrimaryButton title="Go Back" onPress={() => {
            clearTempMatchups();
            router.back()
          }} />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <FieldNameModal
        visible={isNameModalVisible}
        initialName={name}
        onSave={(newName) => {
          setName(newName);
          setIsNameModalVisible(false);
        }}
        onClose={() => setIsNameModalVisible(false)}
      />
      <ScreenHeader
        title="Edit Field"
        onBack={() => {
          clearTempMatchups();
          router.push(`/field/${field.id}`);
        }}
      />

      <View style={styles.content}>
        <MatchupList
          matchups={field.matchups}
          teams={teams}
          games={games}
          onDelete={handleDeleteMatchup}
          onEdit={handleEditMatchup}
          onDragEnd={handleDragEnd}
          ListHeaderComponent={
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.fieldTitle}>
                  {name || "Unnamed Field"}
                </Text>
                <TouchableOpacity onPress={() => setIsNameModalVisible(true)}>
                  <Text style={styles.editNameLink}>Edit Field Name</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.matchupsHeader}>
                <Text style={styles.matchupsTitle}>MatchUps</Text>
                <Text style={styles.matchupsCount}>
                  {field.matchups.length} Scheduled
                </Text>
              </View>
            </>
          }
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.actionButtons}>
          <OutlineButton
            title="+ MatchUp"
            onPress={handleAddMatchup}
            style={styles.actionButton}
          />
        </View>
        <PrimaryButton
          title="Update Field"
          onPress={handleSubmit}
          disabled={!name.trim()}
        />
      </View>
    </GestureHandlerRootView>
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
  titleContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  fieldTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  editNameLink: {
    fontSize: 14,
    color: Colors.secondary,
    textDecorationLine: "underline",
  },
  matchupsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  matchupsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  matchupsCount: {
    fontSize: 13,
    color: Colors.secondary,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
