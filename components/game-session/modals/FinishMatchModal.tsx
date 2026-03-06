import { Colors } from "@/constants/theme";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface FinishMatchModalProps {
    visible: boolean;
    scoreA: number;
    scoreB: number;
    teamAName: string;
    teamBName: string;
    onConfirm: (note?: string) => void;
    onCancel: () => void;
}

export const FinishMatchModal = ({
    visible,
    scoreA,
    scoreB,
    teamAName,
    teamBName,
    onConfirm,
    onCancel,
}: FinishMatchModalProps) => {
    const [note, setNote] = useState("");

    const handleConfirm = () => {
        onConfirm(note.trim() ? note.trim() : undefined);
        setNote("");
    };

    const handleCancel = () => {
        setNote("");
        onCancel();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>End Match Validation</Text>
                    <Text style={styles.modalDescription}>
                        Check the final scores and add an optional referee note before ending the game.
                    </Text>

                    <View style={styles.scoreReviewContainer}>
                        <View style={styles.teamScoreReview}>
                            <Text style={styles.teamNameReview}>{teamAName}</Text>
                            <Text style={styles.scoreTextReview}>{scoreA}</Text>
                        </View>
                        <Text style={styles.vsTextReview}>VS</Text>
                        <View style={styles.teamScoreReview}>
                            <Text style={styles.teamNameReview}>{teamBName}</Text>
                            <Text style={styles.scoreTextReview}>{scoreB}</Text>
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Referee Note / Penalty Log</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Optional details, penalties, rulings..."
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalSecondaryButton} onPress={handleCancel}>
                            <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleConfirm}>
                            <Text style={styles.modalPrimaryButtonText}>End Match</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 24,
    },
    modalContent: {
        backgroundColor: Colors.white,
        padding: 24,
        borderRadius: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: 14,
        color: Colors.secondary,
        marginBottom: 24,
    },
    scoreReviewContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: Colors.background,
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
    },
    teamScoreReview: {
        alignItems: "center",
        flex: 1,
    },
    teamNameReview: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 8,
        textAlign: "center",
    },
    scoreTextReview: {
        fontSize: 32,
        fontWeight: "800",
        color: Colors.primary,
    },
    vsTextReview: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.secondary,
        marginHorizontal: 12,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 16,
        color: Colors.text,
        marginBottom: 24,
        minHeight: 80,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    modalSecondaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: Colors.surface,
    },
    modalSecondaryButtonText: {
        color: Colors.secondary,
        fontWeight: "600",
    },
    modalPrimaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: Colors.error,
    },
    modalPrimaryButtonText: {
        color: Colors.white,
        fontWeight: "600",
    },
});
