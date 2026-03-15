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

export default function ManageFieldScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        id?: string; // fieldId for Edit
        tournamentId?: string; // for Create
    }>();
    const { id, tournamentId } = params;

    const {
        fields,
        teams,
        updateField,
        createField,
        addMatchupToField,
        removeMatchupFromField,
        loadTeams,
        loadFields,
        error,
        reorderMatchupsInField,
        games,
    } = useCoreStore();

    const {
        tempMatchups,
        clearTempMatchups,
        removeTempMatchup,
        reorderTempMatchups
    } = useMatchupCreation();

    const isEditMode = !!id;
    const currentField = fields.find((f) => f.id === id);

    const [name, setName] = useState("");
    const [isNameModalVisible, setIsNameModalVisible] = useState(!isEditMode);

    useFocusEffect(
        useCallback(() => {
            loadTeams();
            loadFields();
        }, [loadTeams, loadFields])
    );

    useEffect(() => {
        if (isEditMode && currentField) {
            setName(currentField.name);
        }
    }, [isEditMode, currentField]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Field name is required");
            return;
        }

        try {
            if (isEditMode) {
                if (!currentField) return;
                await updateField(currentField.id, name.trim());
                router.push(`/field/${currentField.id}`);
            } else {
                if (!tournamentId) {
                    Alert.alert("Error", "Missing tournament context");
                    return;
                }
                const newFieldId = await createField(name.trim(), tournamentId);

                // Add temp matchups to the newly created field
                if (tempMatchups.length > 0) {
                    for (const matchup of tempMatchups) {
                        await addMatchupToField(
                            newFieldId,
                            matchup.teamA,
                            matchup.teamB,
                            matchup.gameModeId,
                        );
                    }
                }
                clearTempMatchups();
                router.push(`/tournament/${tournamentId}` as any);
            }
        } catch (err) {
            Alert.alert("Error", error || "Operation failed");
        }
    };

    const handleAddMatchup = () => {
        const baseUrl = "/field/matchup/manage-matchup";
        const returnUrl = "/field/manage-field";
        const query = isEditMode
            ? `?fieldId=${id}&returnTo=${returnUrl}?id=${id}`
            : `?returnTo=${returnUrl}?tournamentId=${tournamentId}`;

        router.push(`${baseUrl}${query}` as any);
    };

    const handleEditMatchup = (matchupId: string) => {
        const baseUrl = "/field/matchup/manage-matchup";
        const query = isEditMode
            ? `?fieldId=${id}&matchupId=${matchupId}`
            : `?matchupId=${matchupId}`;

        router.push(`${baseUrl}${query}` as any);
    };

    const handleDeleteMatchup = async (matchupId: string) => {
        try {
            if (isEditMode && currentField) {
                await removeMatchupFromField(currentField.id, matchupId);
            } else {
                removeTempMatchup(matchupId);
            }
        } catch {
            Alert.alert("Error", "Unable to delete matchup");
        }
    };

    const handleDragEnd = async (newOrder: any[]) => {
        if (isEditMode && currentField) {
            const newOrderIds = newOrder.map((m) => m.id);
            await reorderMatchupsInField(currentField.id, newOrderIds);
        } else {
            reorderTempMatchups(newOrder);
        }
    };

    const handleBack = () => {
        if (!isEditMode) clearTempMatchups();
        router.back();
    };

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
                title={isEditMode ? "Edit Field" : "Create Field"}
                onBack={handleBack}
            />

            <View style={styles.content}>
                <MatchupList
                    matchups={isEditMode ? (currentField?.matchups || []) : tempMatchups}
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
                                    {isEditMode ? (currentField?.matchups.length || 0) : tempMatchups.length} Scheduled
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
                    title={isEditMode ? "Update Field" : "Create Field"}
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
