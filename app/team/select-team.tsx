import { Avatar } from "@/components/common/Avatar";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { GuestTeamForm } from "@/components/team/GuestTeamForm";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useMatchupCreation } from "@/contexts/MatchupCreationContext";
import { useSearch } from "@/hooks/useSearch";
import { Team } from "@/src/core/domain/Team";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
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

  const handleGuestTeamSubmit = async (name: string, isGuest: boolean) => {
    await createTeam(name, isGuest);
    await loadTeams();
    const newTeam = teams.find((t) => t.name === name);
    if (newTeam) {
      setSelectedTeam(newTeam);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Select Team" onBack={() => router.back()} />

      <ScrollView style={styles.content}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Filter teams..."
        />

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
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.primary}
              />
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.guestSection}>
          <GuestTeamForm onSubmit={handleGuestTeamSubmit} />
        </View>
      </ScrollView>

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
  guestSection: {
    marginTop: Spacing.xxl,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
