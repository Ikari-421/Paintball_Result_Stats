import { Colors } from "@/constants/theme";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ScoreValidationModalProps {
    visible: boolean;
    scoreA: number;
    scoreB: number;
    currentScoreA: number;
    currentScoreB: number;
    teamAName: string;
    teamBName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ScoreValidationModal = ({
    visible,
    scoreA,
    scoreB,
    currentScoreA,
    currentScoreB,
    teamAName,
    teamBName,
    onConfirm,
    onCancel,
}: ScoreValidationModalProps) => {
    const diffA = scoreA - currentScoreA;
    const diffB = scoreB - currentScoreB;
    const winnerName = (diffA === 1 && diffB === 0) ? teamAName : ((diffA === 0 && diffB === 1) ? teamBName : "");
    const actionText = winnerName ? "wins the point!" : "Confirm Adjustments";
    const subtitle = winnerName ? `Confirm this point for the ${diffA === 1 ? 'home' : 'away'} team.` : "Are you sure you want to apply these scores?";

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.titleContainer}>
                        {winnerName ? (
                            <>
                                <Text style={styles.winnerTeamName}>{winnerName}</Text>
                                <Text style={styles.actionText}>{actionText}</Text>
                            </>
                        ) : (
                            <Text style={styles.modalTitle}>{actionText}</Text>
                        )}
                    </View>
                    <Text style={styles.modalDescription}>{subtitle}</Text>

                    <View style={styles.scoreReviewContainer}>
                        <View style={styles.teamScoreReview}>
                            <Text style={styles.teamNameReview}>{teamAName}</Text>
                            <View style={styles.scoreBox}>
                                <Text style={styles.scoreTextReview}>{scoreA}</Text>
                            </View>
                        </View>
                        <Text style={styles.vsTextReview}>VS</Text>
                        <View style={styles.teamScoreReview}>
                            <Text style={styles.teamNameReview}>{teamBName}</Text>
                            <View style={styles.scoreBox}>
                                <Text style={styles.scoreTextReview}>{scoreB}</Text>
                            </View>
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
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        padding: 24,
    },
    modalContent: {
        backgroundColor: Colors.white,
        padding: 24,
        borderRadius: 24,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: Colors.primary,
        textAlign: "center",
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 8,
    },
    winnerTeamName: {
        fontSize: 32,
        fontWeight: "900",
        color: Colors.primary,
        textAlign: "center",
        textTransform: "uppercase",
    },
    actionText: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
        textAlign: "center",
        marginTop: -4,
    },
    modalDescription: {
        fontSize: 15,
        color: Colors.secondary,
        marginBottom: 24,
        textAlign: "center",
    },
    scoreReviewContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: Colors.background,
        padding: 24,
        borderRadius: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    teamScoreReview: {
        alignItems: "center",
        flex: 1,
    },
    teamNameReview: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.secondary,
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    scoreBox: {
        flexDirection: "row",
        alignItems: "flex-end",
    },
    scoreTextReview: {
        fontSize: 48,
        fontWeight: "900",
        color: Colors.text,
    },
    diffText: {
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 4,
        marginBottom: 8,
    },
    positiveDiff: {
        color: "#34C759",
    },
    negativeDiff: {
        color: "#FF3B30",
    },
    vsTextReview: {
        fontSize: 18,
        fontWeight: "900",
        color: "rgba(0,0,0,0.1)",
        marginHorizontal: 10,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
    },
    modalSecondaryButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        alignItems: "center",
    },
    modalSecondaryButtonText: {
        color: Colors.secondary,
        fontWeight: "700",
        fontSize: 16,
    },
    modalPrimaryButton: {
        flex: 2,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: "center",
    },
    modalPrimaryButtonText: {
        color: Colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
});
