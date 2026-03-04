import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useMatchupCreation } from "@/contexts/MatchupCreationContext";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EditMatchupScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        matchupId: string;
        fieldId: string;
    }>();
    const { matchupId, fieldId } = params;

    const { fields, updateMatchupInField, gameModes, teams, loadTeams, loadGameModes } = useCoreStore();
    const { teamA, teamB, gameMode, setTeamA, setTeamB, setGameMode, reset } = useMatchupCreation();

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        loadTeams();
        loadGameModes();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!isInitialized && fields.length > 0 && teams.length > 0 && gameModes.length > 0) {
                const field = fields.find(f => f.id === fieldId);
                if (field) {
                    const matchup = field.matchups.find(m => m.id === matchupId);
                    if (matchup) {
                        if (!teamA) {
                            const foundTeamA = teams.find(t => t.id === matchup.teamA);
                            if (foundTeamA) setTeamA({ id: foundTeamA.id, name: foundTeamA.name });
                        }
                        if (!teamB) {
                            const foundTeamB = teams.find(t => t.id === matchup.teamB);
                            if (foundTeamB) setTeamB({ id: foundTeamB.id, name: foundTeamB.name });
                        }
                        if (!gameMode) {
                            const foundGameMode = gameModes.find(g => g.id === matchup.gameModeId);
                            if (foundGameMode) setGameMode({ id: foundGameMode.id, name: foundGameMode.name });
                        }
                        setIsInitialized(true);
                    }
                }
            }
        }, [isInitialized, fields, teams, gameModes, teamA, teamB, gameMode, fieldId, matchupId])
    );

    const handleSelectTeamA = () => {
        router.push("/team/select-team?role=teamA");
    };

    const handleSelectTeamB = () => {
        router.push("/team/select-team?role=teamB");
    };

    const handleSelectGameMode = () => {
        router.push("/gamemode/select-game-mode");
    };

    const handleUpdateMatchup = async () => {
        if (!teamA || !teamB) {
            Alert.alert("Error", "Please select both teams");
            return;
        }

        if (teamA.id === teamB.id) {
            Alert.alert("Error", "Team A and Team B must be different");
            return;
        }

        if (!gameMode) {
            Alert.alert("Error", "Please select a game mode");
            return;
        }

        if (!fieldId || !matchupId) {
            Alert.alert("Error", "Missing field or matchup id");
            return;
        }

        try {
            await updateMatchupInField(fieldId, matchupId, teamA.id, teamB.id, gameMode.id);
            reset();
            router.back();
        } catch (e) {
            Alert.alert("Error", "Failed to update matchup");
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader
                title="Edit Matchup"
                onBack={() => {
                    reset();
                    router.back();
                }}
            />

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Team A</Text>
                    {teamA ? (
                        <View style={styles.selectedContainer}>
                            <View style={styles.selectedTeam}>
                                <Text style={styles.selectedTeamName}>{teamA.name}</Text>
                                <FontAwesome5
                                    name="check-circle"
                                    size={24}
                                    color={Colors.primary}
                                />
                            </View>
                            <TouchableOpacity onPress={handleSelectTeamA} style={styles.changeButton}>
                                <Text style={styles.changeLinkText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <PrimaryButton title="Select Team" onPress={handleSelectTeamA} />
                    )}
                </View>

                <View style={styles.vsBadge}>
                    <Text style={styles.vsText}>VS</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Team B</Text>
                    {teamB ? (
                        <View style={styles.selectedContainer}>
                            <View style={styles.selectedTeam}>
                                <Text style={styles.selectedTeamName}>{teamB.name}</Text>
                                <FontAwesome5
                                    name="check-circle"
                                    size={24}
                                    color={Colors.primary}
                                />
                            </View>
                            <TouchableOpacity onPress={handleSelectTeamB} style={styles.changeButton}>
                                <Text style={styles.changeLinkText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <OutlineButton title="Select Team" onPress={handleSelectTeamB} />
                    )}
                </View>

                <View style={[styles.card, styles.gameModeCard]}>
                    <Text style={styles.cardTitle}>Game Mode</Text>
                    {gameMode ? (
                        <View style={styles.selectedContainer}>
                            <View style={styles.selectedTeam}>
                                <Text style={styles.selectedTeamName}>{gameMode.name}</Text>
                                <FontAwesome5
                                    name="check-circle"
                                    size={24}
                                    color={Colors.primary}
                                />
                            </View>
                            <TouchableOpacity onPress={handleSelectGameMode} style={styles.changeButton}>
                                <Text style={styles.changeLinkText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <OutlineButton title="Select Game Mode" onPress={handleSelectGameMode} />
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Update MatchUp"
                    onPress={handleUpdateMatchup}
                    disabled={!teamA || !teamB || !gameMode}
                />
            </View>
        </View >
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
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Spacing.lg,
    },
    selectedTeam: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
    },
    selectedTeamName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.primary,
    },
    vsBadge: {
        alignItems: "center",
        marginVertical: Spacing.lg,
    },
    vsText: {
        fontSize: 16,
        fontWeight: "800",
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gameModeCard: {
        marginTop: Spacing.xl,
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    selectedContainer: {
        alignItems: "center",
        gap: Spacing.sm,
    },
    changeButton: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    changeLinkText: {
        color: Colors.primary,
        fontWeight: "600",
        fontSize: 14,
        textDecorationLine: "underline",
    },
});
