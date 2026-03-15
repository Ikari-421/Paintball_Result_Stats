import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useMatchupCreation } from "@/contexts/MatchupCreationContext";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ManageMatchupScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        matchupId?: string;
        fieldId?: string;
    }>();
    const { matchupId, fieldId } = params;

    const {
        fields,
        addMatchupToField,
        updateMatchupInField,
        removeMatchupFromField,
        gameModes,
        teams,
        loadTeams,
        loadGameModes
    } = useCoreStore();

    const {
        teamA, teamB, gameMode,
        setTeamA, setTeamB, setGameMode,
        tempMatchups, addTempMatchup, updateTempMatchup, removeTempMatchup,
        reset
    } = useMatchupCreation();

    const [isInitialized, setIsInitialized] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const isEditMode = !!matchupId;
    const isDirectMode = !!fieldId; // Mode DB vs Mode Temp (Context)

    useEffect(() => {
        loadTeams();
        loadGameModes();
    }, [loadTeams, loadGameModes]);

    // Initialisation des données en mode EDIT
    useFocusEffect(
        useCallback(() => {
            if (isEditMode && !isInitialized && teams.length > 0 && gameModes.length > 0) {
                let foundMatchup;

                if (isDirectMode) {
                    const field = fields.find(f => f.id === fieldId);
                    foundMatchup = field?.matchups.find(m => m.id === matchupId);
                } else {
                    foundMatchup = tempMatchups.find(m => m.id === matchupId);
                }

                if (foundMatchup) {
                    const tA = teams.find(t => t.id === foundMatchup.teamA);
                    const tB = teams.find(t => t.id === foundMatchup.teamB);
                    const mode = gameModes.find(g => g.id === foundMatchup.gameModeId);

                    if (tA) setTeamA({ id: tA.id, name: tA.name });
                    if (tB) setTeamB({ id: tB.id, name: tB.name });
                    if (mode) setGameMode({ id: mode.id, name: mode.name });

                    setIsInitialized(true);
                }
            }
        }, [isEditMode, isInitialized, fields, teams, gameModes, fieldId, matchupId, isDirectMode, tempMatchups, setTeamA, setTeamB, setGameMode])
    );

    const handleSelectTeamA = () => router.push("/team/select-team?role=teamA");
    const handleSelectTeamB = () => router.push("/team/select-team?role=teamB");
    const handleSelectGameMode = () => router.push("/gamemode/select-game-mode");

    const handleSave = async () => {
        if (!teamA || !teamB || !gameMode) {
            Alert.alert("Error", "Please complete all selections");
            return;
        }

        if (teamA.id === teamB.id) {
            Alert.alert("Error", "Teams must be different");
            return;
        }

        setIsProcessing(true);
        try {
            if (isDirectMode) {
                // Sauvegarde DB
                if (isEditMode) {
                    await updateMatchupInField(fieldId!, matchupId!, teamA.id, teamB.id, gameMode.id);
                } else {
                    await addMatchupToField(fieldId!, teamA.id, teamB.id, gameMode.id);
                }
            } else {
                // Sauvegarde Temp (Context)
                if (isEditMode) {
                    updateTempMatchup(matchupId!, {
                        teamA: teamA.id,
                        teamB: teamB.id,
                        teamAName: teamA.name,
                        teamBName: teamB.name,
                        gameModeId: gameMode.id,
                    });
                } else {
                    addTempMatchup({
                        id: `matchup-${Date.now()}`,
                        teamA: teamA.id,
                        teamB: teamB.id,
                        teamAName: teamA.name,
                        teamBName: teamB.name,
                        gameModeId: gameMode.id,
                        order: tempMatchups.length + 1,
                    });
                }
            }
            reset();
            router.back();
        } catch (error) {
            Alert.alert("Error", "Operation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Matchup",
            "Are you sure you want to remove this matchup?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsProcessing(true);
                        try {
                            if (isDirectMode) {
                                await removeMatchupFromField(fieldId!, matchupId!);
                            } else {
                                removeTempMatchup(matchupId!);
                            }
                            reset();
                            router.back();
                        } catch (error) {
                            Alert.alert("Error", "Delete failed");
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScreenHeader
                title={isEditMode ? "Edit Matchup" : "Create Matchup"}
                onBack={() => { reset(); router.back(); }}
            />

            <ScrollView style={styles.content}>
                <View style={[styles.card, styles.teamACard]}>
                    <Text style={styles.cardTitle}>Team A</Text>
                    {teamA ? (
                        <View style={styles.selectedContainer}>
                            <View style={styles.selectedTeam}>
                                <Text style={styles.selectedTeamName}>{teamA.name}</Text>
                                <FontAwesome5 name="check-circle" size={24} color="#34C759" />
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

                <View style={[styles.card, styles.teamBCard]}>
                    <Text style={styles.cardTitle}>Team B</Text>
                    {teamB ? (
                        <View style={styles.selectedContainer}>
                            <View style={styles.selectedTeam}>
                                <Text style={styles.selectedTeamName}>{teamB.name}</Text>
                                <FontAwesome5 name="check-circle" size={24} color="#34C759" />
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
                                <FontAwesome5 name="check-circle" size={24} color="#34C759" />
                            </View>
                            <TouchableOpacity onPress={handleSelectGameMode} style={styles.changeButton}>
                                <Text style={styles.changeLinkText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <OutlineButton title="Select Game Mode" onPress={handleSelectGameMode} />
                    )}
                </View>

                {isEditMode && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <FontAwesome5 name="trash" size={16} color="#FF3B30" />
                        <Text style={styles.deleteButtonText}>Delete MatchUp</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title={isEditMode ? "Update MatchUp" : "Add MatchUp"}
                    onPress={handleSave}
                    disabled={!teamA || !teamB || !gameMode || isProcessing}
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
    teamACard: {
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderColor: Colors.error,
    },
    teamBCard: {
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderColor: "#007AFF",
    },
    gameModeCard: {
        borderColor: Colors.secondary,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        marginTop: Spacing.xl,
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
        fontSize: 24,
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
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxxl,
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
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.sm,
        marginTop: Spacing.xxl,
        marginBottom: Spacing.xl,
        padding: Spacing.md,
    },
    deleteButtonText: {
        color: "#FF3B30",
        fontWeight: "600",
        fontSize: 16,
    },
});
