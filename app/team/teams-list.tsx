import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { TeamCard } from "@/components/team/TeamCard";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useSearch } from "@/hooks/useSearch";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { getAvatarColor } from "@/utils/avatarUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TeamsListScreen() {
  const router = useRouter();
  const { teams, fields, loadTeams, loadFields, createTeam, deleteTeam } =
    useCoreStore();
  const { query, setQuery, filteredItems } = useSearch(teams, "name");
  const { showConfirm } = useConfirmDialog();

  // Add Team Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    loadTeams();
    loadFields();
  }, []);

  const handleAddTeamSubmit = async () => {
    if (!newTeamName.trim()) return;

    await createTeam(newTeamName.trim(), isGuest);

    setNewTeamName("");
    setIsGuest(true);
    setModalVisible(false);
  };

  const handleEdit = (teamId: string) => {
    router.push(`/team/edit-team?id=${teamId}`);
  };

  const handleDelete = (teamId: string, teamName: string) => {
    const isUsedInMatchups = fields.some((field) =>
      field.matchups.some(
        (m: { teamA: string; teamB: string }) =>
          m.teamA === teamId || m.teamB === teamId,
      ),
    );

    if (isUsedInMatchups) {
      Alert.alert(
        "Cannot Delete Team",
        `"${teamName}" is used in active matchups. Please remove the team from all matchups first.`,
      );
      return;
    }
    showConfirm(
      "Delete Team",
      `Are you sure you want to delete "${teamName}"?`,
      async () => {
        await deleteTeam(teamId);
      },
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Teams" onBack={() => router.push("/menu")} />

      <ScrollView style={styles.content}>
        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder="Filter teams..."
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {filteredItems.map((team, index) => (
          <TeamCard
            key={team.id}
            team={team}
            onEdit={() => handleEdit(team.id)}
            onDelete={() => handleDelete(team.id, team.name)}
            avatarColor={getAvatarColor(index)}
          />
        ))}
      </ScrollView>

      {/* Add Team Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Team</Text>

            <Text style={styles.label}>Team Name</Text>
            <TextInput
              style={styles.input}
              value={newTeamName}
              onChangeText={setNewTeamName}
              placeholder="e.g. Red Vipers"
              placeholderTextColor={Colors.secondary}
              autoFocus
            />

            <View style={styles.switchRowContainer}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Guest Team</Text>
                </View>
                <Switch
                  value={isGuest}
                  onValueChange={setIsGuest}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setNewTeamName("");
                  setIsGuest(true);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !newTeamName.trim() && styles.disabledButton,
                ]}
                onPress={handleAddTeamSubmit}
                disabled={!newTeamName.trim()}
              >
                <Text style={styles.confirmButtonText}>Add Team</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  searchWrapper: {
    flex: 1,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: Spacing.xl,
    color: Colors.text,
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
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: Spacing.xl,
  },
  switchRowContainer: {
    marginBottom: Spacing.xl,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.02)",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
