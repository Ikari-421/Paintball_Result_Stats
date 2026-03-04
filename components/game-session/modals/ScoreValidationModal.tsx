import { Colors } from "@/constants/theme";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ScoreValidationModalProps {
    visible: boolean;
    scoreA: number;
    scoreB: number;
    teamAName: string;
    teamBName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ScoreValidationModal = ({
    visible,
    scoreA,
    scoreB,
    teamAName,
    teamBName,
    onConfirm,
    onCancel,
}: ScoreValidationModalProps) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Confirm Score Adjustments</Text>
                    <Text style={styles.modalDescription}>
                        Are you sure you want to apply these scores?
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

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalSecondaryButton} onPress={onCancel}>
                            <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalPrimaryButton} onPress={onConfirm}>
                            <Text style={styles.modalPrimaryButtonText}>Confirm & Save</Text>
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
    },
    teamNameReview: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 8,
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
        backgroundColor: Colors.primary,
    },
    modalPrimaryButtonText: {
        color: Colors.white,
        fontWeight: "600",
    },
});
