import { EmptyState } from "@/components/common/EmptyState";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { FieldCard } from "@/components/field/FieldCard";
import { Colors, Spacing } from "@/constants/theme";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function TournamentDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { tournaments, loadTournaments, fields, loadFields, isLoading, deleteTournament } = useCoreStore();
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteText, setDeleteText] = useState("");

    useEffect(() => {
        loadTournaments();
        loadFields();
    }, []);

    const tournament = tournaments.find((t) => t.id === id);
    const tournamentFields = fields.filter((f) => f.tournamentId === id);

    const getIconColor = (index: number) => {
        return index % 2 === 0 ? Colors.accent : Colors.secondary;
    };

    const handleDelete = async () => {
        if (deleteText !== "Delete") {
            Alert.alert("Error", 'You must type "Delete" to confirm.');
            return;
        }
        try {
            await deleteTournament(id);
            setDeleteModalVisible(false);
            router.push("/tournament/tournaments-list" as any);
        } catch (error) {
            Alert.alert("Error", (error as Error).message);
        }
    };

    if (!tournament) {
        return (
            <View style={styles.container}>
                <ScreenHeader title="Tournament" onBack={() => router.back()} />
                <EmptyState message="Tournament not found" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScreenHeader title={tournament.name} onBack={() => router.push("/tournament/tournaments-list" as any)} />

            <View style={styles.tournamentInfo}>
                <Text style={styles.infoText}>📍 {tournament.location}</Text>
                <Text style={styles.infoText}>📅 {tournament.startDate.toLocaleDateString()} - {tournament.endDate.toLocaleDateString()}</Text>
            </View>

            <ScrollView style={styles.content}>
                {tournamentFields.map((field, index) => (
                    <FieldCard
                        key={field.id}
                        field={field}
                        iconColor={getIconColor(index)}
                        onPress={() => router.push(`/field/${field.id}`)}
                    />
                ))}

                {tournamentFields.length === 0 && !isLoading && (
                    <EmptyState message="No fields available in this tournament" />
                )}
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="+ Create New Field"
                    onPress={() => router.push({ pathname: "/field/create-field", params: { tournamentId: id } } as any)}
                />
                <TouchableOpacity style={styles.editLink} onPress={() => router.push({ pathname: "/tournament/edit-tournament", params: { id } } as any)}>
                    <Text style={styles.editLinkText}>Edit Tournament</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteLink} onPress={() => setDeleteModalVisible(true)}>
                    <Text style={styles.deleteLinkText}>Delete Tournament</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={isDeleteModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Delete Tournament?</Text>
                        <Text style={styles.modalText}>
                            This will permanently delete "{tournament.name}" and all its fields and matchups.
                            Type "Delete" to confirm.
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            value={deleteText}
                            onChangeText={setDeleteText}
                            placeholder="Type Delete"
                            autoCapitalize="none"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => { setDeleteModalVisible(false); setDeleteText(""); }}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmButton, deleteText !== "Delete" && styles.disabledButton]} onPress={handleDelete} disabled={deleteText !== "Delete"}>
                                <Text style={styles.confirmButtonText}>Confirm Delete</Text>
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
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    tournamentInfo: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    infoText: {
        fontSize: 14,
        color: Colors.secondary,
        fontWeight: "500",
    },
    editLink: {
        marginTop: Spacing.xl,
        alignItems: "center",
    },
    editLinkText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: "600",
    },
    deleteLink: {
        marginTop: Spacing.md,
        alignItems: "center",
    },
    deleteLinkText: {
        color: "#ff3b30",
        fontSize: 14,
        fontWeight: "600",
    },
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
        marginBottom: Spacing.sm,
        color: Colors.text,
    },
    modalText: {
        fontSize: 14,
        color: Colors.text,
        opacity: 0.8,
        marginBottom: Spacing.lg,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: Spacing.md,
        fontSize: 16,
        marginBottom: Spacing.xl,
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
        backgroundColor: "#ff3b30",
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: 8,
    },
    disabledButton: {
        opacity: 0.5,
    },
    confirmButtonText: {
        color: Colors.white,
        fontWeight: "600",
    },
});
