import { Colors } from "@/constants/theme";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface NextMatchDetails {
    matchupId: string;
    teamAName: string;
    teamBName: string;
    scoreA: number;
    scoreB: number;
    gameModeName: string;
    breakTimeSeconds: number;
}

interface ScoreValidationModalProps {
    visible: boolean;
    scoreA: number;
    scoreB: number;
    previousScoreA: number;
    previousScoreB: number;
    teamAName: string;
    teamBName: string;
    isMatchOver: boolean;
    nextMatchDetails: NextMatchDetails | null;
    onStartBreak: () => void;
    onTechnicalTimeout: () => void;
    onUndo: () => void;
}

export const ScoreValidationModal = ({
    visible,
    scoreA,
    scoreB,
    previousScoreA,
    previousScoreB,
    teamAName,
    teamBName,
    isMatchOver,
    nextMatchDetails,
    onStartBreak,
    onTechnicalTimeout,
    onUndo,
}: ScoreValidationModalProps) => {
    const diffA = scoreA - previousScoreA;
    const diffB = scoreB - previousScoreB;
    const winnerName = (diffA === 1 && diffB === 0) ? teamAName : ((diffA === 0 && diffB === 1) ? teamBName : "");

    let actionText = winnerName ? "wins the point!" : "Score Adjusted";
    if (winnerName && isMatchOver) {
        actionText = "wins the point & the match!";
    }

    let primaryButtonText = "Validate & Start break to next round";
    if (nextMatchDetails) {
        primaryButtonText = "Validate & Start next matchup";
    } else if (isMatchOver) {
        primaryButtonText = "Validate & Exit to Field";
    }

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

                    {nextMatchDetails && (
                        <View style={styles.nextMatchContainer}>
                            <Text style={styles.nextMatchTitle}>Next Match</Text>
                            <View style={styles.nextMatchTeams}>
                                <Text style={styles.nextMatchTeamName}>{nextMatchDetails.teamAName}</Text>
                                <Text style={styles.nextMatchScore}>{nextMatchDetails.scoreA} - {nextMatchDetails.scoreB}</Text>
                                <Text style={styles.nextMatchTeamName}>{nextMatchDetails.teamBName}</Text>
                            </View>
                            <View style={styles.nextMatchInfo}>
                                <Text style={styles.nextMatchInfoText}>
                                    Game Mode: <Text style={{ fontWeight: "bold" }}>{nextMatchDetails.gameModeName}</Text>
                                </Text>
                                <Text style={styles.nextMatchInfoText}>
                                    Break Time: <Text style={{ fontWeight: "bold" }}>{nextMatchDetails.breakTimeSeconds}</Text> sec
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalSecondaryButton} onPress={onUndo}>
                            <Text style={styles.modalSecondaryButtonText}>Cancel (Undo)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalPrimaryButton} onPress={onStartBreak}>
                            <Text style={styles.modalPrimaryButtonText}>{primaryButtonText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalTertiaryButton} onPress={onTechnicalTimeout}>
                            <Text style={styles.modalTertiaryButtonText}>Technical Timeout</Text>
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
        marginBottom: 16,
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    winnerTeamName: {
        fontSize: 28,
        fontWeight: "900",
        color: Colors.primary,
        textAlign: "center",
        textTransform: "uppercase",
    },
    actionText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.secondary,
        textAlign: "center",
        marginTop: 4,
        marginBottom: 16,
    },
    nextMatchContainer: {
        backgroundColor: Colors.background,
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        alignItems: "center",
    },
    nextMatchTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: Colors.primary,
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    nextMatchTeams: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        gap: 12,
    },
    nextMatchTeamName: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        flex: 1,
        textAlign: "center",
    },
    nextMatchScore: {
        fontSize: 24,
        fontWeight: "900",
        color: Colors.text,
        backgroundColor: Colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    nextMatchInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
        paddingTop: 12,
    },
    nextMatchInfoText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.secondary,
    },
    modalButtons: {
        flexDirection: "column",
        gap: 12,
    },
    modalSecondaryButton: {
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        alignItems: "center",
        width: '100%',
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    modalSecondaryButtonText: {
        color: Colors.text,
        fontWeight: "700",
        fontSize: 16,
    },
    modalPrimaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: "center",
        width: '100%',
    },
    modalPrimaryButtonText: {
        color: Colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
    modalTertiaryButton: {
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "transparent",
        alignItems: "center",
        width: '100%',
        marginTop: -4,
    },
    modalTertiaryButtonText: {
        color: Colors.primary,
        fontWeight: "700",
        fontSize: 15,
        textDecorationLine: "underline",
    },
});
