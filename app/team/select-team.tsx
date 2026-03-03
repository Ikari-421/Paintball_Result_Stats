import { Avatar } from "@/components/common/Avatar";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useMatchupCreation } from "@/contexts/MatchupCreationContext";
import { useSearch } from "@/hooks/useSearch";
import { Team } from "@/src/core/domain/Team";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SelectTeamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const { teams, loadTeams, createTeam } = useCoreStore();
  const { teamA, teamB, setTeamA, setTeamB } = useMatchupCreation();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { query, setQuery, filteredItems } = useSearch(teams, "name");

  // Add Team Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (params.role === "teamA" && teamA) {
      setSelectedTeam(teams.find((t) => t.id === teamA.id) || null);
    } else if (params.role === "teamB" && teamB) {
      setSelectedTeam(teams.find((t) => t.id === teamB.id) || null);
    }
  }, [params.role, teamA, teamB, teams]);

  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleContinue = () => {
    if (!selectedTeam) return;

    const teamSelection = {
      id: selectedTeam.id,
      name: selectedTeam.name,
    };

    if (params.role === "teamA") {
      setTeamA(teamSelection);
    } else if (params.role === "teamB") {
      setTeamB(teamSelection);
    }

    router.back();
  };

  const handleAddTeamSubmit = async () => {
    if (!newTeamName.trim()) return;

    await createTeam(newTeamName.trim(), isGuest);

    // Fetch latest teams from the store directly because the local 'teams' variable is stale
    const currentTeams = useCoreStore.getState().teams;
    const newTeam = currentTeams.find((t) => t.name === newTeamName.trim());

    // Select the newly created team
    if (newTeam) {
      setSelectedTeam(newTeam);
    }

    // Reset and close modal
    setNewTeamName("");
    setIsGuest(false);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Select Team" onBack={() => router.back()} />

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
            <FontAwesome5 name="plus" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {filteredItems.map((team) => (
          <TouchableOpacity
            key={team.id}
            style={[
              styles.teamCard,
              selectedTeam?.id === team.id && styles.teamCardSelected,
            ]}
            onPress={() => handleSelectTeam(team)}
          >
            <Avatar
              initial={team.name.charAt(0).toUpperCase()}
              color={Colors.primary}
              size={40}
            />
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{team.name}</Text>
            </View>
            {selectedTeam?.id === team.id && (
              <FontAwesome5
                name="check-circle"
                size={24}
                color={Colors.primary}
              />
            )}
          </TouchableOpacity>
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
                  setIsGuest(false);
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

      <View style={styles.footer}>
        <PrimaryButton
          title="Select & Continue"
          onPress={handleContinue}
          disabled={!selectedTeam}
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
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamCardSelected: {
    borderColor: Colors.primary,
  },
  teamInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: 0,
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
  subtext: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
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
